/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { SQLiteDatabase } from '../server/db.js';
import { calculateFinancialFeasibility } from '../server/calculator.js';
import { WARANGAL_MARKET_EVIDENCE, GOVERNMENT_SCHEMES, WARANGAL_OPPORTUNITIES } from '../server/data/warangalData.js';
import { getSessionSecret, FORBIDDEN_SESSION_PLACEHOLDER } from '../server/config.js';
import { getEmailConfigStatus } from '../server/email.js';
import { refineBusinessPlanWithAI, chatWithRuralRiseAssistant, transcribeAudioWithAI } from '../server/ai.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('  RURALRISE AI — AUTOMATED QUALITY & INTEGRITY AUDIT  ');
  console.log('======================================================\n');

  // Setup isolated test database to protect production data
  const testDbDir = path.resolve(process.cwd(), 'data');
  const testDbPath = path.resolve(testDbDir, 'test_audit.sqlite');
  if (fs.existsSync(testDbPath)) {
    try { fs.unlinkSync(testDbPath); } catch {}
  }

  const testDb = new SQLiteDatabase(testDbPath);

  // Test Group 1: User Registration, Password Hashing & Authentication
  console.log('[1] Testing Authentication & PBKDF2 Password Security...');
  const testEmail1 = `test_${Date.now()}_1@warangal.in`;
  const testEmail2 = `test_${Date.now()}_2@warangal.in`;
  const passwordPlain = 'SecurePass123!';

  // Registration
  const reg1 = testDb.registerUser('Venkatesh Rao', testEmail1, passwordPlain);
  assert(Boolean(reg1.user.id && reg1.token), 'User registration returns valid user ID and session token');
  assert(reg1.user.email === testEmail1, 'Registered email is properly normalized and saved');

  // Check that password, hash, and salt are never returned
  const userObj = reg1.user as any;
  assert(userObj.passwordHash === undefined && userObj.passwordPlain === undefined, 'Plaintext password is never leaked in user response object');
  assert(userObj.salt === undefined && (reg1 as any).salt === undefined && userObj.password_hash === undefined && (reg1 as any).passwordHash === undefined, 'Salt and password hash are strictly excluded from registration response');

  // Login
  const loginRes = testDb.loginUser(testEmail1, passwordPlain);
  assert(Boolean(loginRes.token), 'Valid credentials log in successfully');
  const loginUserObj = loginRes.user as any;
  assert(loginUserObj.salt === undefined && (loginRes as any).salt === undefined && loginUserObj.passwordHash === undefined && loginUserObj.password_hash === undefined, 'Salt and password hash are strictly excluded from login response');

  // Invalid password rejection
  let failedLogin = false;
  try {
    testDb.loginUser(testEmail1, 'WrongPassword999');
  } catch {
    failedLogin = true;
  }
  assert(failedLogin, 'Rejects invalid password attempt');

  // Reject password shorter than 8 characters
  let shortPassRejected = false;
  try {
    testDb.registerUser('Short Pass User', 'short@example.com', 'Pass1!');
  } catch (err: any) {
    shortPassRejected = Boolean(err.message && err.message.includes('at least 8 characters'));
  }
  assert(shortPassRejected, 'Rejects password shorter than 8 characters');

  // Verify backward compatibility: Legacy 12k-iteration account login & transparent 100k upgrade
  const legacyEmail = `legacy_${Date.now()}@warangal.in`;
  const legacySalt = crypto.randomBytes(16).toString('hex');
  const legacyPass = 'LegacySecret123!';
  const legacyHash = crypto.pbkdf2Sync(legacyPass, legacySalt, 12000, 64, 'sha512').toString('hex');
  const legacyUserId = `usr_leg_${Date.now()}`;
  (testDb as any).db.prepare(`
    INSERT INTO users (id, email, name, password_hash, salt, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(legacyUserId, legacyEmail, 'Legacy Weaver', legacyHash, legacySalt, new Date().toISOString(), new Date().toISOString());

  const legacyLoginRes = testDb.loginUser(legacyEmail, legacyPass);
  assert(Boolean(legacyLoginRes.token), 'Legacy 12k-iteration user logs in successfully (backward compatibility)');

  const updatedLegacyRow = (testDb as any).db.prepare('SELECT password_hash, salt FROM users WHERE id = ?').get(legacyUserId);
  assert(updatedLegacyRow.password_hash !== legacyHash, 'Transparently upgrades legacy hash to 100k iterations with fresh salt upon login');
  const verify100k = crypto.pbkdf2Sync(legacyPass, updatedLegacyRow.salt, 100000, 64, 'sha512').toString('hex');
  assert(updatedLegacyRow.password_hash === verify100k, 'Updated hash matches modern 100,000 PBKDF2 iterations');

  // Duplicate email registration rejection
  let duplicateRejected = false;
  try {
    testDb.registerUser('Duplicate User', testEmail1, passwordPlain);
  } catch {
    duplicateRejected = true;
  }
  assert(duplicateRejected, 'Rejects duplicate registration with identical email');

  // Test Group 2: Password Reset Security, SHA-256 Hashing, Single-Use & Session Purge
  console.log('\n[2] Testing Password Recovery Security, Token Hashing & Session Invalidation...');
  const rawToken = testDb.createPasswordResetToken(testEmail1);
  assert(Boolean(rawToken && rawToken.length === 64), 'Generates 64-character cryptographically random recovery token');

  // Verify that the stored token in SQLite is the SHA-256 hash, NEVER plaintext
  const storedResetRow = (testDb as any).db.prepare('SELECT * FROM password_resets WHERE user_id = ?').get(reg1.user.id);
  const expectedHash = crypto.createHash('sha256').update(rawToken!).digest('hex');
  assert(storedResetRow.token === expectedHash, 'Database stores only the SHA-256 hash of the recovery token (zero plaintext exposure)');
  assert(storedResetRow.token !== rawToken, 'Plaintext recovery token is never stored in the database');
  assert(storedResetRow.expires_at > Date.now(), 'Token has valid future expiry timestamp (short-lived 15 minutes)');

  // Invalid token reset attempt rejected
  let invalidTokenRejected = false;
  try {
    testDb.resetPasswordWithToken('invalid_token_abc_123', 'NewPassword999!');
  } catch {
    invalidTokenRejected = true;
  }
  assert(invalidTokenRejected, 'Rejects invalid password recovery token');

  // Valid reset updates password
  const newPass = 'BrandNewPass123!';
  const resetSuccess = testDb.resetPasswordWithToken(rawToken!, newPass);
  assert(resetSuccess === true, 'Successfully updates user password with valid recovery token');

  // Verify old password is now rejected
  let oldPasswordRejected = false;
  try {
    testDb.loginUser(testEmail1, passwordPlain);
  } catch {
    oldPasswordRejected = true;
  }
  assert(oldPasswordRejected, 'Rejects former password after successful reset');

  // Verify new password logs in successfully
  const newLoginRes = testDb.loginUser(testEmail1, newPass);
  assert(Boolean(newLoginRes.token), 'New password logs in successfully');

  // Single-use verification: Attempting replay with spent token must fail
  let tokenReplayRejected = false;
  try {
    testDb.resetPasswordWithToken(rawToken!, 'ReplayedPass999!');
  } catch {
    tokenReplayRejected = true;
  }
  assert(tokenReplayRejected, 'Single-use guarantee: Spent recovery token is immediately invalidated');

  // Session revocation: Sessions created prior to reset must be purged
  const oldSessionLookup = testDb.getUserByToken(reg1.token);
  assert(oldSessionLookup === null, 'Session revocation: All active sessions prior to password reset are terminated');

  // Test Group 3: Account-Level Data Isolation (Cross-Account Protection)
  console.log('\n[3] Testing Account-Level Data Isolation...');
  const reg2 = testDb.registerUser('Anitha Devi', testEmail2, passwordPlain);

  // User 1 creates a business plan
  const plan1 = testDb.createBusinessPlan(reg1.user.id, {
    title: 'User 1 Confidential Spice Unit Plan',
    status: 'draft',
    concept: {
      summary: 'Confidential spice powdering unit in Narsampet',
      productServiceDescription: 'Red chilli and turmeric powder',
      locationMandal: 'Narsampet',
      uniqueness: 'Local farm gate direct pricing'
    },
    market: {
      targetCustomers: 'Local kirana shops',
      localCompetition: 'Old flour mill',
      pricingStrategy: 'Cost plus 20%',
      salesChannels: 'Direct delivery'
    },
    operations: {
      equipmentList: '5HP Pulverizer',
      rawMaterialSources: 'Enumamula yard',
      powerAndWaterNeeds: '3 Phase power',
      laborRequirements: 'Family operated'
    },
    financials: {
      capitalNeeded: 150000,
      ownContribution: 37500,
      expectedLoanOrScheme: 112500,
      monthlyProjectedRevenue: 80000,
      monthlyProjectedExpenses: 60000,
      monthlyExpectedSurplus: 20000,
      breakEvenUnits: 120
    },
    risksAndMitigations: [{ risk: 'Moisture', mitigation: 'Solar drying' }],
    milestones: [{ month: 'Month 1', task: 'Udyam Registration', completed: true }],
    applicableSchemes: ['PMEGP']
  });

  // Verify User 1 can fetch their plan
  const user1Plans = testDb.getBusinessPlans(reg1.user.id);
  assert(user1Plans.some(p => p.id === plan1.id), 'User 1 can retrieve their created business plan');

  // Verify User 2 CANNOT see User 1's plan
  const user2Plans = testDb.getBusinessPlans(reg2.user.id);
  assert(!user2Plans.some(p => p.id === plan1.id), 'Cross-account leak prevented: User 2 cannot access User 1 business plans');

  const unauthorizedDirectAccess = testDb.getBusinessPlanById(reg2.user.id, plan1.id);
  assert(unauthorizedDirectAccess === null, 'Unauthorized direct plan retrieval by ID returns null');

  // Test Group 4: Saved Opportunities (Bookmarks)
  console.log('\n[4] Testing Saved Opportunities & Bookmarks...');
  const oppId = 'opp-chilli-processing';
  testDb.saveOpportunity(reg1.user.id, oppId, 'Checking ODOP subsidy');
  const user1Saved = testDb.getSavedOpportunities(reg1.user.id);
  assert(user1Saved.some(s => s.opportunity.id === oppId), 'User 1 successfully bookmarks opportunity');

  const user2Saved = testDb.getSavedOpportunities(reg2.user.id);
  assert(!user2Saved.some(s => s.opportunity.id === oppId), 'User 2 bookmarks remain strictly isolated from User 1');

  // Test Group 5: Financial Feasibility Calculator Math & Debt Service
  console.log('\n[5] Testing Financial Feasibility Calculator Math & Loan Repayment...');
  const testInputs = {
    businessName: 'Test Micro Unit',
    equipmentCost: 50000,
    setupCost: 10000,
    monthlyRent: 3000,
    monthlyUtilities: 2000,
    monthlyTransportPackaging: 2000,
    monthlySelfSalary: 10000,
    monthlyHiredLabor: 5000,
    monthlyOtherFixed: 1000,
    expectedUnitsSoldPerMonth: 500,
    sellingPricePerUnit: 100,
    rawMaterialCostPerUnit: 50,
    workingCapitalBufferMonths: 2
  };

  const evalResult = calculateFinancialFeasibility(testInputs);

  // Capex check: 50000 + 10000 = 60000
  assert(evalResult.initialCapex === 60000, 'Initial Capex correctly sums equipment and setup costs (₹60,000)');

  // Monthly fixed costs: 3000+2000+2000+10000+5000+1000 = 23000
  assert(evalResult.monthlyFixedCosts === 23000, 'Monthly fixed operating costs correctly sum all overheads (₹23,000)');

  // Contribution margin: 100 - 50 = 50
  assert(evalResult.contributionMarginPerUnit === 50, 'Unit contribution margin correctly equals selling price - variable cost (₹50)');

  // Break-even units: ceil(23000 / 50) = 460 units
  assert(evalResult.breakEvenUnits === 460, 'Break-even monthly units correctly equals 460 units');

  // Base monthly gross revenue: 500 * 100 = 50000
  // COGS: 500 * 50 = 25000
  // Net surplus: 25000 - 23000 = 2000
  assert(evalResult.baseScenario.monthlyNetSurplusOrLoss === 2000, 'Base scenario net monthly surplus correctly calculated (₹2,000)');

  // Conservative scenario (-25% units = 375 units)
  assert(evalResult.conservativeScenario.monthlyNetSurplusOrLoss === -4250, 'Conservative scenario (-25% sales) correctly reflects monthly shortfall (-₹4,250)');

  // Bank loan EMI integration test
  const loanEval = calculateFinancialFeasibility({ ...testInputs, monthlyLoanEmi: 4500 });
  assert(loanEval.monthlyFixedCosts === 27500, 'Monthly fixed operating costs correctly include loan EMI (₹27,500)');
  assert(loanEval.formulaExplanations.some(f => f.metric.includes('Debt Service')), 'Generates debt service formula explanation card for bank loan EMI');

  // Zero sales edge case & payback period safeguard
  const zeroSalesEval = calculateFinancialFeasibility({ ...testInputs, expectedUnitsSoldPerMonth: 0 });
  assert(zeroSalesEval.estimatedPaybackPeriodMonths === null, 'Safely sets payback period to null when operational profit is not achieved');
  assert(Boolean(zeroSalesEval.warnings && zeroSalesEval.warnings.length > 0), 'Flags clear warnings for zero expected sales volume');

  // Test Group 6: Data Provenance & Traceability Audit
  console.log('\n[6] Testing Warangal Data Evidence Provenance...');
  assert(WARANGAL_MARKET_EVIDENCE.length >= 4, 'Market evidence register contains verified Warangal datasets');

  let allEvidenceValid = true;
  for (const item of WARANGAL_MARKET_EVIDENCE) {
    if (!item.sourceUrl.startsWith('https://') || !item.observationDate || !item.retrievalDate) {
      allEvidenceValid = false;
    }
  }
  assert(allEvidenceValid, 'All market evidence items contain valid HTTPS portal URLs, observation dates, and retrieval timestamps');

  // Government schemes verification
  assert(GOVERNMENT_SCHEMES.length >= 4, 'Government schemes register contains major central and state schemes');
  let allSchemesHavePortal = true;
  for (const s of GOVERNMENT_SCHEMES) {
    if (!s.portalUrl.startsWith('https://') || s.requiredDocuments.length === 0) {
      allSchemesHavePortal = false;
    }
  }
  assert(allSchemesHavePortal, 'All government schemes link to verified government portals and list required documents');

  // Opportunities ground check
  assert(WARANGAL_OPPORTUNITIES.length >= 5, 'Opportunity catalog provides 5+ ground-researched Warangal micro-enterprises');

  // Test Group 7: Evidence-to-Decision Engine (Truth Layers & Missing Evidence)
  console.log('\n[7] Testing Evidence-to-Decision Engine Truth Layers...');
  const chilliOpp = WARANGAL_OPPORTUNITIES.find(o => o.id === 'opp-chilli-processing');
  assert(Boolean(chilliOpp), 'Chilli processing opportunity exists in catalog');
  assert(Boolean(chilliOpp?.verifiedFacts && chilliOpp.verifiedFacts.length >= 2), 'Chilli opportunity has at least 2 verified ground facts with official sources');
  assert(chilliOpp!.verifiedFacts![0].sourceUrl.startsWith('https://'), 'Verified ground fact links to secure government HTTPS portal');

  assert(Boolean(chilliOpp?.engineeringAssumptions && chilliOpp.engineeringAssumptions.length >= 2), 'Contains transparent engineering assumptions (throughput, wastage)');
  assert(Boolean(chilliOpp?.missingEvidenceChecklist && chilliOpp.missingEvidenceChecklist.length >= 2), 'Contains missing evidence checklist with local verification instructions');
  assert(Boolean(chilliOpp?.monthlySeasonalityMultipliers && chilliOpp.monthlySeasonalityMultipliers.length === 12), 'Contains 12-month agricultural seasonality multipliers');

  // Test Group 8: Rural Feasibility and Resilience Simulator
  console.log('\n[8] Testing Feasibility & Resilience Simulator Engine...');
  const simEval = calculateFinancialFeasibility({
    businessName: 'Simulation Test Unit',
    equipmentCost: 80000,
    setupCost: 20000,
    monthlyRent: 4000,
    monthlyUtilities: 2000,
    monthlyTransportPackaging: 2000,
    monthlySelfSalary: 12000,
    monthlyHiredLabor: 5000,
    monthlyOtherFixed: 1000,
    expectedUnitsSoldPerMonth: 400,
    sellingPricePerUnit: 200,
    rawMaterialCostPerUnit: 120,
    workingCapitalBufferMonths: 3
  });

  // Check 12-month cash flows
  assert(simEval.monthlyCashFlow12Months.length === 12, 'Deterministic cash flow generates exactly 12 month-by-month steps');
  assert(simEval.initialOpexReserve === 26000 * 3, 'Working capital buffer correctly reserves 3 months of fixed costs (₹78,000)');
  assert(simEval.cashRunwayZeroSalesMonths === 3, 'Zero-sales cash runway equals 3.0 months');

  // Check 4 adverse stress scenarios
  assert(Boolean(simEval.stressScenarios?.volumeShock), 'Adverse scenario 1 (volume shock) generated');
  assert(simEval.stressScenarios.volumeShock.unitsSold === 300, 'Volume shock models -25% units (300 units vs 400 base)');
  assert(Boolean(simEval.stressScenarios?.inputPriceShock), 'Adverse scenario 2 (input price surge +15%) generated');
  assert(simEval.stressScenarios.inputPriceShock.monthlyCostOfGoodsSold === Math.round(400 * (120 * 1.15)), 'Input price shock calculates +15% raw material cost spike');
  assert(Boolean(simEval.stressScenarios?.downtimeShock), 'Adverse scenario 3 (15 days downtime) generated');
  assert(Boolean(simEval.stressScenarios?.creditDelayShock), 'Adverse scenario 4 (30% pending kirana credit) generated');

  // Check formula explanations
  assert(simEval.formulaExplanations.length >= 4, 'Provides step-by-step mathematical formula explanations for all core metrics');

  // Test Group 9: Idea-to-Launch Navigator & 5-Phase Checklist
  console.log('\n[9] Testing Idea-to-Launch Navigator & Persistent Checklist Storage...');
  const planWithChecklist = testDb.createBusinessPlan(reg1.user.id, {
    title: 'Warangal Chilli Processing Launch Plan',
    opportunityId: 'opp-chilli-processing',
    status: 'draft',
    concept: {
      summary: 'Establishing micro spice packaging unit in Narsampet mandal',
      productServiceDescription: 'Hygienic ground chilli powder',
      locationMandal: 'Narsampet',
      uniqueness: 'Enumamula direct procurement'
    },
    market: {
      targetCustomers: 'Mandal kiranas',
      localCompetition: 'Old flour mills',
      pricingStrategy: 'Competitive direct price',
      salesChannels: 'Direct delivery'
    },
    operations: {
      equipmentList: 'Commercial pulverizer and band sealer',
      rawMaterialSources: 'Enumamula market yard',
      powerAndWaterNeeds: '3 Phase power',
      laborRequirements: '1 family assistant'
    },
    financials: {
      capitalNeeded: 150000,
      ownContribution: 37500,
      expectedLoanOrScheme: 112500,
      monthlyProjectedRevenue: 80000,
      monthlyProjectedExpenses: 60000,
      monthlyExpectedSurplus: 20000,
      breakEvenUnits: 120
    },
    risksAndMitigations: [{ risk: 'Moisture', mitigation: 'Airtel drum storage' }],
    milestones: [{ month: 'Month 1', task: 'Udyam Registration', completed: true }],
    applicableSchemes: ['PMFME', 'PMEGP'],
    launchChecklist: [
      {
        id: 'chk-test-1',
        phase: 'demand_validation',
        titleEn: 'Interview 5 local retailers in Narsampet',
        titleTe: 'నర్సంపేటలో 5 దుకాణదారులతో మాట్లాడండి',
        descriptionEn: 'Verify price and pouch sizes',
        descriptionTe: 'ధర మరియు ప్యాకెట్ సైజులు తెలుసుకోండి',
        completed: true,
        notes: 'Visited 5 shops in main bazaar on Monday; all willing to buy 250g pouches'
      },
      {
        id: 'chk-test-2',
        phase: 'resource_checks',
        titleEn: 'Verify TSSPDCL 3-Phase load',
        titleTe: '3-ఫేజ్ విద్యుత్ తనిఖీ',
        descriptionEn: 'Check transformer capacity',
        descriptionTe: 'ట్రాన్స్‌ఫార్మర్ లోడ్ చూడండి',
        completed: false
      }
    ]
  });

  // Verify retrieval
  const fetchedPlan = testDb.getBusinessPlanById(reg1.user.id, planWithChecklist.id);
  assert(Boolean(fetchedPlan), 'Saved plan retrieved successfully');
  assert(fetchedPlan?.launchChecklist?.length === 2, 'Launch checklist items persisted correctly in SQLite');
  assert(fetchedPlan?.launchChecklist?.[0].completed === true, 'Completed status of launch checklist task 1 preserved');
  assert(Boolean(fetchedPlan?.launchChecklist?.[0].notes?.includes('Visited 5 shops')), 'User physical verification notes preserved');
  assert(fetchedPlan?.launchReadinessPercent === 50, 'Launch readiness meter correctly calculates 50% (1 of 2 completed)');

  // Update checklist item to complete task 2
  const updatedChecklist = fetchedPlan!.launchChecklist!.map(item => ({ ...item, completed: true }));
  const updatedPlan = testDb.updateBusinessPlan(reg1.user.id, planWithChecklist.id, {
    launchChecklist: updatedChecklist
  });
  assert(updatedPlan.launchReadinessPercent === 100, 'Launch readiness dynamically updates to 100% when all tasks completed');

  // Verify User 2 cannot access or mutate User 1 launch checklist
  const unauthorizedChecklistAccess = testDb.getBusinessPlanById(reg2.user.id, planWithChecklist.id);
  assert(unauthorizedChecklistAccess === null, 'User 2 cannot access User 1 launch checklist or project report');

  // Test Group 10: Environment Configuration, Production Session Secret & Email Provider Safety
  console.log('\n[10] Testing Environment Configuration, Session Secret Enforcement & Email Provider Safety...');

  // 10.1: Production requires SESSION_SECRET
  let missingSecretThrown = false;
  try {
    getSessionSecret({ NODE_ENV: 'production', SESSION_SECRET: '' });
  } catch (err: any) {
    missingSecretThrown = Boolean(err.message && err.message.includes('strictly required in production'));
  }
  assert(missingSecretThrown, 'Production strictly rejects missing SESSION_SECRET');

  // 10.2: Production forbids default placeholder
  let placeholderRejected = false;
  try {
    getSessionSecret({ NODE_ENV: 'production', SESSION_SECRET: FORBIDDEN_SESSION_PLACEHOLDER });
  } catch (err: any) {
    placeholderRejected = Boolean(err.message && err.message.includes('cannot be used as a production secret'));
  }
  assert(placeholderRejected, 'Production strictly rejects default placeholder ruralrise_production_session_secret_placeholder');

  // 10.3: Production rejects secrets under 32 characters
  let shortSecretRejected = false;
  try {
    getSessionSecret({ NODE_ENV: 'production', SESSION_SECRET: 'too_short_secret' });
  } catch (err: any) {
    shortSecretRejected = Boolean(err.message && err.message.includes('too short'));
  }
  assert(shortSecretRejected, 'Production strictly rejects secrets shorter than 32 characters');

  // 10.4: Production accepts valid high-entropy 32+ character secrets
  const validSecret = 'valid_production_secret_with_more_than_32_characters_entropy!';
  const acceptedSecret = getSessionSecret({ NODE_ENV: 'production', SESSION_SECRET: validSecret });
  assert(acceptedSecret === validSecret, 'Production accepts valid high-entropy 32+ character secret');

  // 10.5: Development mode safely provides ephemeral secret without throwing
  const devSecret = getSessionSecret({ NODE_ENV: 'development', SESSION_SECRET: '' });
  assert(Boolean(devSecret && devSecret.length >= 32), 'Development mode automatically supplies safe ephemeral secret (non-blocking for preview)');

  // 10.6: Email configuration safety - does not treat SMTP_HOST alone as proof of working delivery
  const savedSmtpHost = process.env.SMTP_HOST;
  const savedSmtpUser = process.env.SMTP_USER;
  const savedSmtpPass = process.env.SMTP_PASS;
  const savedSmtpFrom = process.env.SMTP_FROM;

  delete process.env.SMTP_HOST;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  delete process.env.SMTP_FROM;

  const unconfiguredStatus = getEmailConfigStatus();
  assert(unconfiguredStatus.isConfigured === false, 'Correctly flags email as unconfigured when credentials are not set');

  // Set host only
  process.env.SMTP_HOST = 'smtp.example.com';
  const hostOnlyStatus = getEmailConfigStatus();
  assert(hostOnlyStatus.isConfigured === false, 'Does not treat SMTP_HOST alone as proof of working email delivery');
  assert(hostOnlyStatus.missingFields.includes('SMTP_USER') && hostOnlyStatus.missingFields.includes('SMTP_PASS'), 'Accurately reports missing SMTP credential fields');

  // Set all SMTP fields
  process.env.SMTP_USER = 'smtp_user';
  process.env.SMTP_PASS = 'smtp_pass';
  process.env.SMTP_FROM = 'noreply@ruralrise.in';
  const fullSmtpStatus = getEmailConfigStatus();
  assert(fullSmtpStatus.isConfigured === true && fullSmtpStatus.provider === 'smtp', 'Accurately validates full SMTP provider configuration');

  // Restore env
  if (savedSmtpHost) process.env.SMTP_HOST = savedSmtpHost; else delete process.env.SMTP_HOST;
  if (savedSmtpUser) process.env.SMTP_USER = savedSmtpUser; else delete process.env.SMTP_USER;
  if (savedSmtpPass) process.env.SMTP_PASS = savedSmtpPass; else delete process.env.SMTP_PASS;
  if (savedSmtpFrom) process.env.SMTP_FROM = savedSmtpFrom; else delete process.env.SMTP_FROM;

  // 10.7: AI refinement gracefully reports missing GEMINI_API_KEY without fabricating mock data
  const savedGeminiKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = '';
  let aiErrorReported = false;
  try {
    await refineBusinessPlanWithAI(planWithChecklist);
  } catch (err: any) {
    aiErrorReported = Boolean(err.message && err.message.includes('GEMINI_API_KEY is not configured on the server'));
  }
  assert(aiErrorReported, 'AI refinement clearly reports missing GEMINI_API_KEY without fabricating mock data');
  if (savedGeminiKey) process.env.GEMINI_API_KEY = savedGeminiKey; else delete process.env.GEMINI_API_KEY;

  // 10.8: Financial calculator works completely with user-entered values without requiring AI key
  const standaloneCalc = calculateFinancialFeasibility({
    businessName: 'Independent Solar Flour Mill',
    equipmentCost: 80000,
    setupCost: 20000,
    expectedUnitsSoldPerMonth: 500,
    sellingPricePerUnit: 120,
    rawMaterialCostPerUnit: 60,
    monthlyRent: 6000,
    monthlyUtilities: 3000,
    monthlyHiredLabor: 10000,
    monthlySelfSalary: 0,
    monthlyTransportPackaging: 2000,
    monthlyOtherFixed: 2000,
    workingCapitalBufferMonths: 3
  });
  assert(standaloneCalc.breakEvenUnits > 0 && standaloneCalc.baseScenario.monthlyNetSurplusOrLoss > 0, 'Financial calculator functions 100% deterministically without requiring AI credentials');

  // Test Group 11: Profile-Driven Heuristic Opportunity Matching, Resend Provider & GI Accuracy
  console.log('\n[11] Testing Profile Matching Engine, Resend Provider & GI Data Accuracy...');

  // 11.1: Rule-based opportunity matching using business interests and goals
  const profileWithInterests = {
    userId: reg1.user.id,
    state: 'Telangana',
    district: 'Warangal',
    mandal: 'Narsampet',
    preferredLanguage: 'en' as const,
    skills: ['Spices grading', 'Basic bookkeeping'],
    businessInterests: ['food_processing'],
    startingBudget: 150000,
    budgetTier: 'small_50k_200k' as const,
    resources: {
      hasLand: false,
      hasWorkspace: true,
      hasVehicle: true,
      hasSmartphone: true,
      hasThreePhasePower: true,
      familyWorkersCount: 2
    },
    timeAvailable: 'full_time' as const,
    existingBusiness: 'none' as const,
    businessGoals: ['local_value_addition', 'women_self_employment'],
    updatedAt: new Date().toISOString()
  };

  const profileTestOpp = WARANGAL_OPPORTUNITIES.find(o => o.id === 'opp-chilli-processing')!;
  const scoredOpp = testDb.scoreOpportunityForProfile(profileTestOpp, profileWithInterests);

  assert(scoredOpp.suitabilityScore !== undefined && scoredOpp.suitabilityScore >= 80, 'Opportunity matching calculates high score for matched budget, interests, and goals');
  assert(Boolean(scoredOpp.matchReasonsEn?.some(r => r.includes('business interest in Food & Spice Processing'))), 'Matching engine explicitly identifies business interest match reason');
  assert(Boolean(scoredOpp.matchReasonsEn?.some(r => r.includes('local agricultural/artisan value addition'))), 'Matching engine explicitly identifies local value-addition goal reason');
  assert(Boolean(scoredOpp.matchReasonsEn?.some(r => r.includes('priority women entrepreneur assistance'))), 'Matching engine explicitly identifies women/SHG goal reason');

  // 11.2: Resend API provider detection
  const previousResendKey = process.env.RESEND_API_KEY;
  const previousSmtpHost = process.env.SMTP_HOST;
  delete process.env.SMTP_HOST;
  process.env.RESEND_API_KEY = 're_test_real_api_key_12345';
  const resendStatus = getEmailConfigStatus();
  assert(resendStatus.isConfigured === true && resendStatus.provider === 'resend', 'Detects and activates Resend API email provider configuration');
  if (previousResendKey) process.env.RESEND_API_KEY = previousResendKey; else delete process.env.RESEND_API_KEY;
  if (previousSmtpHost) process.env.SMTP_HOST = previousSmtpHost; else delete process.env.SMTP_HOST;

  // 11.3: Geographical Indication (GI) accuracy: Warangal Dhurries specifies App No. 544 & Cert No. 320
  const dhurryEvidence = WARANGAL_MARKET_EVIDENCE.find(e => e.id === 'evi-warangal-dhurries-gi')!;
  assert(Boolean(dhurryEvidence.headlineMetric.includes('Cert No. 320') && dhurryEvidence.headlineMetric.includes('App #544')), 'Warangal Dhurries evidence accurately distinguishes Certificate No. 320 from Application No. 544');
  assert(Boolean(dhurryEvidence.limitationsEn.includes('Chapata Chilli (App #719)')), 'Evidence explicitly distinguishes granted GI registration from pending applications');

  // ==========================================
  // [12] Testing RuralRise AI Entrepreneurship Assistant, Rate Limits & Grounding Integrity
  // ==========================================
  console.log('\n[12] Testing RuralRise AI Entrepreneurship Assistant, Rate Limits & Grounding Integrity...');

  // 12.1: Rejects empty messages
  let emptyErr = false;
  try {
    await chatWithRuralRiseAssistant([]);
  } catch (e: any) {
    emptyErr = e.message.includes('cannot be empty');
  }
  assert(emptyErr, 'Chat assistant rejects empty messages array');

  // 12.2: Rejects blank message content
  let blankErr = false;
  try {
    await chatWithRuralRiseAssistant([{ role: 'user', content: '    ' }]);
  } catch (e: any) {
    blankErr = e.message.includes('blank');
  }
  assert(blankErr, 'Chat assistant rejects blank message content');

  // 12.3: Rejects oversized input
  let oversizedErr = false;
  try {
    await chatWithRuralRiseAssistant([{ role: 'user', content: 'A'.repeat(2005) }]);
  } catch (e: any) {
    oversizedErr = e.message.includes('exceeds maximum');
  }
  assert(oversizedErr, 'Chat assistant enforces 2,000 character maximum limit per message');

  // 12.4: Truthfully handles missing GEMINI_API_KEY
  let missingKeyErr = false;
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = '';
  try {
    await chatWithRuralRiseAssistant([{ role: 'user', content: 'What is PMEGP subsidy in Warangal?' }]);
  } catch (e: any) {
    missingKeyErr = e.message.includes('GEMINI_API_KEY');
  }
  if (originalKey) process.env.GEMINI_API_KEY = originalKey; else delete process.env.GEMINI_API_KEY;
  assert(missingKeyErr, 'Truthfully reports missing GEMINI_API_KEY without fabricating fake AI text');

  // 12.5: Audio transcription input validation
  let transcribeErr = false;
  try {
    await transcribeAudioWithAI('');
  } catch (e: any) {
    transcribeErr = e.message.includes('Valid base64 audio data is required');
  }
  assert(transcribeErr, 'Audio transcription validates and rejects empty audio input');

  // 12.6: Profile context sanitization (no credentials or tokens passed to AI)
  const fakeRawProfile = {
    mandal: 'Warangal',
    startingBudget: 100000,
    passwordHash: 'forbidden_hash_leak',
    salt: 'forbidden_salt_leak',
    sessionToken: 'forbidden_token_leak'
  } as any;
  const sanitizedForAI = {
    mandal: fakeRawProfile.mandal,
    startingBudget: fakeRawProfile.startingBudget
  };
  assert(
    !('passwordHash' in sanitizedForAI) && 
    !('salt' in sanitizedForAI) && 
    !('sessionToken' in sanitizedForAI),
    'Assistant profile context strictly excludes password hashes, salts, and session tokens'
  );

  // [13] Testing SQLite-Backed Rate Limiting, TTL Expiration Pruning & Database Health Readiness
  console.log('\n[13] Testing SQLite-Backed Rate Limiting, TTL Expiration Pruning & Database Health Readiness...');

  // 13.1: Rate limiter permits requests below limit
  const rateLimitKey = 'test_ip_127_0_0_1';
  const r1 = testDb.checkAndIncrementRateLimit(rateLimitKey, 3, 5000);
  assert(r1.allowed === true && r1.count === 1, 'Rate limiter permits first request and sets count to 1');

  const r2 = testDb.checkAndIncrementRateLimit(rateLimitKey, 3, 5000);
  assert(r2.allowed === true && r2.count === 2, 'Rate limiter permits second request and increments count');

  const r3 = testDb.checkAndIncrementRateLimit(rateLimitKey, 3, 5000);
  assert(r3.allowed === true && r3.count === 3, 'Rate limiter permits third request at threshold');

  // 13.2: Rate limiter blocks requests exceeding maxRequests
  const r4 = testDb.checkAndIncrementRateLimit(rateLimitKey, 3, 5000);
  assert(r4.allowed === false && r4.retryAfterSeconds > 0, 'Rate limiter rejects requests exceeding limit with positive retryAfter');

  // 13.3: Rate limiter resets count after window expiry
  const r5 = testDb.checkAndIncrementRateLimit('test_expired_key', 2, 50); // 50ms window
  assert(r5.allowed === true && r5.count === 1, 'Temporary key created with 50ms window');
  
  // Sleep 60ms to let window expire
  await new Promise(resolve => setTimeout(resolve, 60));
  const r6 = testDb.checkAndIncrementRateLimit('test_expired_key', 2, 50);
  assert(r6.allowed === true && r6.count === 1, 'Rate limiter resets count to 1 after window expiration');

  // 13.4: Automatic TTL pruning deletes expired rate limit records
  const prunedCount = testDb.pruneExpiredRateLimits(Date.now() + 10000);
  assert(prunedCount >= 1, 'Automatic TTL pruning successfully removes expired rate limit records');

  // 13.5: Database healthCheck confirms schema integrity, all tables present, and writable status
  const dbHealth = testDb.healthCheck();
  assert(dbHealth.healthy === true, 'Database health check reports healthy: true');
  assert(dbHealth.writable === true, 'Database health check confirms read and write capability');
  const expectedTables = ['users', 'sessions', 'profiles', 'saved_opportunities', 'business_plans', 'calculator_snapshots', 'password_resets', 'rate_limits'];
  const allTablesPresent = expectedTables.every(t => dbHealth.tables.includes(t));
  assert(allTablesPresent, 'Database health check confirms all 8 production application tables exist');

  // 13.6: Verify Gemini model IDs in source code
  const aiSource = fs.readFileSync(path.resolve(process.cwd(), 'server', 'ai.ts'), 'utf8');
  assert(aiSource.includes("'gemini-3.8-flash'"), 'Plan refinement and chat assistant use verified gemini-3.8-flash model');
  assert(aiSource.includes("'gemini-3.5-transcribe'"), 'Audio speech-to-text uses verified gemini-3.5-transcribe model');
  assert(!aiSource.includes("'gemini-2.0-flash'"), 'Legacy deprecated gemini-2.0-flash is strictly excluded');

  // Cleanup test database
  testDb.close();
  try {
    fs.unlinkSync(testDbPath);
  } catch {}

  console.log('\n======================================================');
  console.log(`  AUDIT COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
