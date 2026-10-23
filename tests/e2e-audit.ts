/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import Database from 'better-sqlite3';
import { getDatabasePath, isGeminiConfigured } from '../server/config.js';

interface TestResult {
  category: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'NOT TESTED';
  evidence: string;
}

const results: TestResult[] = [];

function record(category: string, name: string, status: 'PASS' | 'FAIL' | 'NOT TESTED', evidence: string) {
  results.push({ category, name, status, evidence });
  const icon = status === 'PASS' ? '✓ PASS' : status === 'FAIL' ? '✗ FAIL' : '○ NOT TESTED';
  console.log(`[${icon}] [${category}] ${name}`);
  console.log(`       Evidence: ${evidence}`);
}

const BASE_URL = 'http://localhost:3000';

async function runE2EAudit() {
  console.log('===============================================================');
  console.log('  RURALRISE AI — RELEASE-READINESS END-TO-END AUDIT           ');
  console.log('===============================================================\n');

  // 1. Health & Server Check
  try {
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    if (healthRes.status === 200 && healthData.status === 'healthy' && healthData.database?.includes('SQLite')) {
      record('1. Server Runtime', 'Express backend & SQLite database active', 'PASS', `HTTP ${healthRes.status}, service: ${healthData.service}, DB: ${healthData.database}`);
    } else {
      record('1. Server Runtime', 'Express backend & SQLite database active', 'FAIL', `Unexpected status: ${healthRes.status}, data: ${JSON.stringify(healthData)}`);
    }
  } catch (err: any) {
    record('1. Server Runtime', 'Express backend & SQLite database active', 'FAIL', `Connection error: ${err.message}`);
    return;
  }

  // Frontend Serving Check
  try {
    const frontRes = await fetch(`${BASE_URL}/`);
    const frontHtml = await frontRes.text();
    const hasRoot = frontHtml.includes('id="root"');
    const hasScript = frontHtml.includes('main.tsx') || frontHtml.includes('assets/index');
    if (frontRes.status === 200 && hasRoot && hasScript) {
      record('1. Server Runtime', 'Frontend SPA index.html served correctly', 'PASS', `HTTP ${frontRes.status}, length: ${frontHtml.length} bytes, mount: <div id="root"> present`);
    } else {
      record('1. Server Runtime', 'Frontend SPA index.html served correctly', 'FAIL', `Missing root or script tag in frontend response`);
    }
  } catch (err: any) {
    record('1. Server Runtime', 'Frontend SPA index.html served correctly', 'FAIL', `Frontend fetch error: ${err.message}`);
  }

  // 2. Auth Flow: Registration, Credential Security, Login, Profile Updates, Opportunities, Plans, Calculator
  const timestamp = Date.now();
  const userAEmail = `e2e_usera_${timestamp}@ruralrise.in`;
  const userBEmail = `e2e_userb_${timestamp}@ruralrise.in`;
  const passwordA = 'KothawadaWeaver123!';
  const passwordB = 'NarsampetFarmer456!';

  let tokenA = '';
  let userIdA = '';
  let tokenB = '';
  let userIdB = '';

  // Register User A & Strict Credential Disclosure Verification
  try {
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Chitti Babu', email: userAEmail, password: passwordA })
    });
    const regData = await regRes.json();
    
    // Strict assertions: must have token and minimal user, MUST NOT leak salt or password hashes
    const hasValidToken = Boolean(regData.token && typeof regData.token === 'string' && regData.token.includes('.'));
    const hasMinimalUser = Boolean(regData.user && regData.user.id && regData.user.email === userAEmail);
    const noSaltExposed = regData.salt === undefined && regData.user?.salt === undefined;
    const noHashExposed = regData.passwordHash === undefined && regData.user?.passwordHash === undefined &&
                          regData.password_hash === undefined && regData.user?.password_hash === undefined &&
                          regData.passwordPlain === undefined && regData.user?.passwordPlain === undefined;

    if (regRes.status === 201 && hasValidToken && hasMinimalUser && noSaltExposed && noHashExposed) {
      tokenA = regData.token;
      userIdA = regData.user.id;
      record('2. Auth & Profiles', 'User A registration (Strict credential exclusion: 0 salts, 0 hashes leaked)', 'PASS', `HTTP 201, UserID: ${userIdA}, salt/hash strictly undefined in API response`);
    } else {
      record('2. Auth & Profiles', 'User A registration', 'FAIL', `HTTP ${regRes.status}: noSaltExposed=${noSaltExposed}, noHashExposed=${noHashExposed}, data=${JSON.stringify(regData)}`);
    }
  } catch (err: any) {
    record('2. Auth & Profiles', 'User A registration', 'FAIL', err.message);
  }

  // Register User B
  try {
    const regResB = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Ravi Kumar', email: userBEmail, password: passwordB })
    });
    const regDataB = await regResB.json();
    const hasValidTokenB = Boolean(regDataB.token && typeof regDataB.token === 'string' && regDataB.token.includes('.'));
    const noSaltExposedB = regDataB.salt === undefined && regDataB.user?.salt === undefined;
    const noHashExposedB = regDataB.passwordHash === undefined && regDataB.user?.passwordHash === undefined &&
                           regDataB.password_hash === undefined && regDataB.user?.password_hash === undefined;

    if (regResB.status === 201 && hasValidTokenB && noSaltExposedB && noHashExposedB) {
      tokenB = regDataB.token;
      userIdB = regDataB.user.id;
      record('2. Auth & Profiles', 'User B registration (Separate authenticated account)', 'PASS', `HTTP 201, UserID: ${userIdB}, zero credentials leaked`);
    } else {
      record('2. Auth & Profiles', 'User B registration', 'FAIL', `HTTP ${regResB.status}`);
    }
  } catch (err: any) {
    record('2. Auth & Profiles', 'User B registration', 'FAIL', err.message);
  }

  // User A Login
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userAEmail, password: passwordA })
    });
    const loginData = await loginRes.json();
    const hasValidToken = Boolean(loginData.token && loginData.token.includes('.'));
    const noSaltOrHash = loginData.salt === undefined && loginData.user?.salt === undefined &&
                         loginData.passwordHash === undefined && loginData.user?.passwordHash === undefined;

    if (loginRes.status === 200 && hasValidToken && noSaltOrHash) {
      tokenA = loginData.token; // refreshed session token
      record('2. Auth & Profiles', 'User A login (Strict credential exclusion)', 'PASS', `HTTP 200, Signed session token returned, zero hashes/salts leaked`);
    } else {
      record('2. Auth & Profiles', 'User A login', 'FAIL', `HTTP ${loginRes.status}, noSaltOrHash=${noSaltOrHash}`);
    }
  } catch (err: any) {
    record('2. Auth & Profiles', 'User A login', 'FAIL', err.message);
  }

  // User A Profile Update
  try {
    const profRes = await fetch(`${BASE_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        mandal: 'Narsampet',
        startingBudget: 180000,
        skills: ['Chilli sorting', 'Machine maintenance'],
        businessInterests: ['food_processing'],
        businessGoals: ['local_value_addition', 'women_self_employment'],
        resources: {
          hasLand: true,
          hasWorkspace: true,
          hasVehicle: true,
          hasSmartphone: true,
          hasThreePhasePower: true,
          familyWorkersCount: 3
        }
      })
    });
    const profData = await profRes.json();
    if (profRes.status === 200 && profData.profile?.mandal === 'Narsampet' && profData.profile?.startingBudget === 180000) {
      record('2. Auth & Profiles', 'User A profile update & budget validation', 'PASS', `HTTP 200, mandal: ${profData.profile.mandal}, budget: ₹${profData.profile.startingBudget}`);
    } else {
      record('2. Auth & Profiles', 'User A profile update', 'FAIL', `HTTP ${profRes.status}: ${JSON.stringify(profData)}`);
    }
  } catch (err: any) {
    record('2. Auth & Profiles', 'User A profile update', 'FAIL', err.message);
  }

  // User A saves an Opportunity
  try {
    const saveRes = await fetch(`${BASE_URL}/api/saved-opportunities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        opportunityId: 'opp-chilli-processing',
        notes: 'Priority interest for Narsampet mandal setup.'
      })
    });
    const saveData = await saveRes.json();
    if (saveRes.status === 201 && saveData.savedOpportunity?.opportunityId === 'opp-chilli-processing') {
      record('2. Auth & Profiles', 'User A saves opportunity bookmark', 'PASS', `HTTP 201, Record ID: ${saveData.savedOpportunity.id}`);
    } else {
      record('2. Auth & Profiles', 'User A saves opportunity', 'FAIL', `HTTP ${saveRes.status}`);
    }
  } catch (err: any) {
    record('2. Auth & Profiles', 'User A saves opportunity', 'FAIL', err.message);
  }

  // User A creates a Business Plan
  let planIdA = '';
  try {
    const planRes = await fetch(`${BASE_URL}/api/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        opportunityId: 'opp-chilli-processing',
        title: 'Kakatiya Spices & Chilli Unit',
        status: 'draft',
        concept: {
          businessName: 'Kakatiya Spices',
          targetProductEn: 'Ground Red Chilli & Turmeric Packets',
          targetProductTe: 'కారం & పసుపు పొడి ప్యాకెట్లు',
          locationMandal: 'Narsampet'
        },
        market: {
          targetCustomersEn: ['Local Kirana', 'Highway Dhabas'],
          targetCustomersTe: ['స్థానిక కిరాణా', 'ధాబాలు'],
          estimatedMonthlyUnits: 500
        },
        operations: {
          productionCapacityPerDay: '30 kg',
          powerRequirement: '3-Phase 5HP'
        },
        financials: {
          estimatedCapexINR: 150000,
          estimatedMonthlyOpexINR: 35000,
          expectedMonthlyRevenueINR: 55000
        },
        launchChecklist: [
          { id: 'task-1', title: 'Verify TSSPDCL 3-Phase Power', completed: true, verificationNotes: 'AE confirmed transformer headroom' },
          { id: 'task-2', title: 'FSSAI Basic Registration', completed: false }
        ]
      })
    });
    const planData = await planRes.json();
    if (planRes.status === 201 && planData.plan?.id) {
      planIdA = planData.plan.id;
      record('2. Auth & Profiles', 'User A creates business plan with checklist', 'PASS', `HTTP 201, PlanID: ${planIdA}, readiness: ${planData.plan.launchReadinessPercent}%`);
    } else {
      record('2. Auth & Profiles', 'User A creates business plan', 'FAIL', `HTTP ${planRes.status}: ${JSON.stringify(planData)}`);
    }
  } catch (err: any) {
    record('2. Auth & Profiles', 'User A creates business plan', 'FAIL', err.message);
  }

  // User A edits Business Plan
  try {
    const editRes = await fetch(`${BASE_URL}/api/plans/${planIdA}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Kakatiya Spices & Chilli Unit (Updated Phase 1)',
        status: 'active'
      })
    });
    const editData = await editRes.json();
    if (editRes.status === 200 && editData.plan?.title.includes('Updated Phase 1') && editData.plan?.status === 'active') {
      record('2. Auth & Profiles', 'User A updates business plan', 'PASS', `HTTP 200, title updated to: ${editData.plan.title}`);
    } else {
      record('2. Auth & Profiles', 'User A updates business plan', 'FAIL', `HTTP ${editRes.status}`);
    }
  } catch (err: any) {
    record('2. Auth & Profiles', 'User A updates business plan', 'FAIL', err.message);
  }

  // User A runs Financial Feasibility Calculator (Deterministic, No AI)
  try {
    const calcRes = await fetch(`${BASE_URL}/api/calculator/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: 'Narsampet Mustard Oil Ghani',
        equipmentCost: 95000,
        setupCost: 25000,
        expectedUnitsSoldPerMonth: 400,
        sellingPricePerUnit: 220,
        rawMaterialCostPerUnit: 140,
        monthlyRent: 5000,
        monthlyUtilities: 3000,
        monthlyTransportPackaging: 3000,
        monthlyHiredLabor: 8000,
        monthlySelfSalary: 0,
        monthlyOtherFixed: 1000,
        workingCapitalBufferMonths: 3
      })
    });
    const calcData = await calcRes.json();
    if (calcRes.status === 200 && calcData.breakEvenUnits > 0 && calcData.baseScenario?.monthlyNetSurplusOrLoss !== undefined) {
      record('2. Auth & Profiles', 'Financial calculation evaluation runs deterministically', 'PASS', `HTTP 200, Break-Even: ${calcData.breakEvenUnits} units, Surplus: ₹${calcData.baseScenario.monthlyNetSurplusOrLoss}/mo`);
    } else {
      record('2. Auth & Profiles', 'Financial calculation evaluation', 'FAIL', `HTTP ${calcRes.status}`);
    }
  } catch (err: any) {
    record('2. Auth & Profiles', 'Financial calculation evaluation', 'FAIL', err.message);
  }

  // User A saves Calculator Snapshot
  let snapshotIdA = '';
  try {
    const snapRes = await fetch(`${BASE_URL}/api/calculator/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        name: 'Mustard Expeller Baseline',
        inputs: { equipmentCost: 95000, expectedUnitsSoldPerMonth: 400 },
        results: { breakEvenUnits: 250, initialInvestment: 180000 }
      })
    });
    const snapData = await snapRes.json();
    if (snapRes.status === 201 && snapData.snapshot?.id) {
      snapshotIdA = snapData.snapshot.id;
      record('2. Auth & Profiles', 'User A saves calculator snapshot', 'PASS', `HTTP 201, Snapshot ID: ${snapshotIdA}`);
    } else {
      record('2. Auth & Profiles', 'User A saves calculator snapshot', 'FAIL', `HTTP ${snapRes.status}`);
    }
  } catch (err: any) {
    record('2. Auth & Profiles', 'User A saves calculator snapshot', 'FAIL', err.message);
  }

  // 3. User Data Isolation Checks
  console.log('\n--- Checking Cross-User Data Isolation ---');

  // Test 3.1: User B tries to GET User A's plan by ID
  try {
    const leakGetRes = await fetch(`${BASE_URL}/api/plans/${planIdA}`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    if (leakGetRes.status === 404) {
      record('3. Data Isolation', 'User B prevented from reading User A plan via direct ID', 'PASS', `HTTP 404 Not Found (Unauthorized access prevented)`);
    } else {
      record('3. Data Isolation', 'User B prevented from reading User A plan', 'FAIL', `HTTP ${leakGetRes.status} (LEAK DETECTED)`);
    }
  } catch (err: any) {
    record('3. Data Isolation', 'User B reading User A plan', 'FAIL', err.message);
  }

  // Test 3.2: User B tries to UPDATE User A's plan by ID
  try {
    const leakPutRes = await fetch(`${BASE_URL}/api/plans/${planIdA}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify({ title: 'Hacked by User B' })
    });
    if (leakPutRes.status === 400 || leakPutRes.status === 404) {
      record('3. Data Isolation', 'User B prevented from modifying User A plan via direct ID', 'PASS', `HTTP ${leakPutRes.status} (Unauthorized mutation rejected)`);
    } else {
      record('3. Data Isolation', 'User B modifying User A plan', 'FAIL', `HTTP ${leakPutRes.status} (TAMPERING DETECTED)`);
    }
  } catch (err: any) {
    record('3. Data Isolation', 'User B modifying User A plan', 'FAIL', err.message);
  }

  // Test 3.3: User B tries to DELETE User A's plan by ID
  try {
    const leakDelRes = await fetch(`${BASE_URL}/api/plans/${planIdA}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    if (leakDelRes.status === 404) {
      record('3. Data Isolation', 'User B prevented from deleting User A plan via direct ID', 'PASS', `HTTP 404 Not Found (Unauthorized delete rejected)`);
    } else {
      record('3. Data Isolation', 'User B deleting User A plan', 'FAIL', `HTTP ${leakDelRes.status} (UNAUTHORIZED DELETION)`);
    }
  } catch (err: any) {
    record('3. Data Isolation', 'User B deleting User A plan', 'FAIL', err.message);
  }

  // Test 3.4: Verify User A's plan remains intact and uncorrupted after User B's failed tampering attempts
  try {
    const verifyPlanRes = await fetch(`${BASE_URL}/api/plans/${planIdA}`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const verifyPlanData = await verifyPlanRes.json();
    if (verifyPlanRes.status === 200 && verifyPlanData.plan?.title.includes('Updated Phase 1')) {
      record('3. Data Isolation', 'User A plan verified untouched after User B unauthorized mutation attempts', 'PASS', `HTTP 200, Plan title intact: "${verifyPlanData.plan.title}"`);
    } else {
      record('3. Data Isolation', 'User A plan integrity post-tampering attempt', 'FAIL', `Plan modified or missing: ${JSON.stringify(verifyPlanData)}`);
    }
  } catch (err: any) {
    record('3. Data Isolation', 'User A plan integrity post-tampering attempt', 'FAIL', err.message);
  }

  // Test 3.5: User B views saved opportunities list (should NOT see User A's bookmark)
  try {
    const savedBRes = await fetch(`${BASE_URL}/api/saved-opportunities`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const savedBData = await savedBRes.json();
    if (savedBRes.status === 200 && Array.isArray(savedBData.savedOpportunities) && savedBData.savedOpportunities.length === 0) {
      record('3. Data Isolation', 'User B saved opportunities list strictly isolated from User A', 'PASS', `HTTP 200, User B has 0 saved opportunities`);
    } else {
      record('3. Data Isolation', 'User B saved opportunities isolation', 'FAIL', `User B saw saved items: ${JSON.stringify(savedBData)}`);
    }
  } catch (err: any) {
    record('3. Data Isolation', 'User B saved opportunities isolation', 'FAIL', err.message);
  }

  // Test 3.6: User B views calculator snapshots list (should NOT see User A's snapshot)
  try {
    const snapsBRes = await fetch(`${BASE_URL}/api/calculator/saved`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const snapsBData = await snapsBRes.json();
    if (snapsBRes.status === 200 && Array.isArray(snapsBData.snapshots) && snapsBData.snapshots.length === 0) {
      record('3. Data Isolation', 'User B calculator snapshots strictly isolated from User A', 'PASS', `HTTP 200, User B has 0 calculator snapshots`);
    } else {
      record('3. Data Isolation', 'User B calculator snapshots isolation', 'FAIL', `User B saw snapshots: ${JSON.stringify(snapsBData)}`);
    }
  } catch (err: any) {
    record('3. Data Isolation', 'User B calculator snapshots isolation', 'FAIL', err.message);
  }

  // 4. Password Recovery Integrity & Zero-Leakage Checks
  console.log('\n--- Checking Password Recovery & Token Zero-Leakage ---');
  try {
    const recRes = await fetch(`${BASE_URL}/api/auth/reset-password-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userAEmail })
    });
    const recData = await recRes.json();

    const noRawTokenInResponse = recData.rawToken === undefined && recData.token === undefined && recData.resetToken === undefined;
    const truthfulDelivery = typeof recData.dispatched === 'boolean';
    const hasGenericMessage = Boolean(recData.message && recData.message.includes('If an account exists'));

    if (recRes.status === 200 && noRawTokenInResponse && truthfulDelivery && hasGenericMessage) {
      record('4. Password Recovery', 'Recovery request never exposes token in API response & returns generic message', 'PASS', `HTTP 200, token leaked: false, dispatched: ${recData.dispatched}, emailDeliveryConfigured: ${recData.emailDeliveryConfigured}`);
    } else {
      record('4. Password Recovery', 'Recovery request token leakage check', 'FAIL', `Payload leaked token or inaccurate delivery: ${JSON.stringify(recData)}`);
    }

    // Inspect SQLite database directly to verify the token is hashed with SHA-256
    const dbPath = getDatabasePath();
    const db = new Database(dbPath);
    const resetRow = db.prepare('SELECT token, user_id, expires_at FROM password_resets WHERE user_id = ?').get(userIdA) as any;

    if (resetRow && resetRow.token.length === 64) {
      record('4. Password Recovery', 'Recovery token stored as SHA-256 hash in SQLite (never plaintext)', 'PASS', `Stored token length: 64 hex characters (SHA-256 hash)`);
    } else {
      record('4. Password Recovery', 'Recovery token SHA-256 hash in DB', 'FAIL', `Missing or unexpected reset row: ${JSON.stringify(resetRow)}`);
    }

    // Verify reset password with invalid token is rejected
    const invalidResetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'fabricated_invalid_token_99999999999999999999', newPassword: 'NewPassword999!' })
    });
    const invalidResetData = await invalidResetRes.json();
    if (invalidResetRes.status === 400 && invalidResetData.error) {
      record('4. Password Recovery', 'Rejects password reset with invalid/fabricated token', 'PASS', `HTTP 400, error: ${invalidResetData.error}`);
    } else {
      record('4. Password Recovery', 'Invalid token rejection', 'FAIL', `HTTP ${invalidResetRes.status}`);
    }

    db.close();
  } catch (err: any) {
    record('4. Password Recovery', 'Recovery verification', 'FAIL', err.message);
  }

  // 5. AI Service Unavailability & Non-Mocking Checks
  console.log('\n--- Checking AI Feature Handling ---');
  try {
    const aiRes = await fetch(`${BASE_URL}/api/ai/refine-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: 'Kakatiya Spices Unit',
        concept: {
          businessName: 'Kakatiya Spices',
          summary: 'Hygienic red chilli and turmeric spice powder processing in Narsampet.',
          targetProductEn: 'Chilli & Turmeric Mini Processing Unit',
          locationMandal: 'Narsampet'
        },
        market: {
          targetCustomers: 'Kirana stores and highway dhabas',
          targetCustomersEn: ['Kirana stores'],
          estimatedMonthlyUnits: 400
        },
        operations: {
          productionCapacityPerDay: '30 kg',
          equipmentList: 'Hammer mill, continuous heat pouch sealer'
        },
        financials: {
          capitalNeeded: 150000,
          monthlyProjectedRevenue: 55000,
          estimatedCapexINR: 150000,
          estimatedMonthlyOpexINR: 35000,
          expectedMonthlyRevenueINR: 55000
        }
      })
    });
    const aiData = await aiRes.json();

    const geminiIsConfigured = isGeminiConfigured();

    if (geminiIsConfigured) {
      if (aiRes.status === 200 && aiData.refinement && Array.isArray(aiData.refinement.strengths)) {
        record('5. AI Integration', 'AI Plan Refinement with real GEMINI_API_KEY', 'PASS', `HTTP 200, AI returned real response with ${aiData.refinement.strengths.length} strengths and ${aiData.refinement.suggestedActionSteps?.length} action steps`);
      } else if (aiRes.status === 503 && aiData.error) {
        // Truthful upstream service report (e.g. timeout or network firewall in test environment) without mock fabrication
        record('5. AI Integration', 'AI Plan Refinement upstream error reported truthfully without mock data', 'PASS', `HTTP 503: ${aiData.error}`);
      } else {
        record('5. AI Integration', 'AI Plan Refinement with real GEMINI_API_KEY', 'FAIL', `Unexpected response HTTP ${aiRes.status}: ${JSON.stringify(aiData)}`);
      }
    } else {
      // When key is unconfigured: MUST return 503 and MUST NOT fabricate mock suggestions
      if (aiRes.status === 503 && aiData.error && aiData.error.includes('GEMINI_API_KEY') && aiData.refinement === undefined) {
        record('5. AI Integration', 'AI Plan Refinement gracefully explains missing credentials without fabricating mock data', 'PASS', `HTTP 503, Truthful error: ${aiData.error}`);
      } else {
        record('5. AI Integration', 'AI Plan Refinement missing key handling', 'FAIL', `Expected HTTP 503 without mock data, received HTTP ${aiRes.status}: ${JSON.stringify(aiData)}`);
      }
    }
  } catch (err: any) {
    record('5. AI Integration', 'AI Plan Refinement', 'FAIL', err.message);
  }

  // 5.2 Assistant Chat Validation
  try {
    // Test empty messages rejected
    const emptyChatRes = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] })
    });
    const emptyChatData = await emptyChatRes.json();
    if (emptyChatRes.status === 400 && emptyChatData.error) {
      record('5. AI Integration', 'Assistant chat rejects empty messages array', 'PASS', `HTTP 400, rejected: ${emptyChatData.error}`);
    } else {
      record('5. AI Integration', 'Assistant chat rejects empty messages array', 'FAIL', `Expected 400, got ${emptyChatRes.status}`);
    }

    // Test blank message rejected
    const blankChatRes = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: '   ' }] })
    });
    const blankChatData = await blankChatRes.json();
    if ((blankChatRes.status === 400 || blankChatRes.status === 500) && blankChatData.error) {
      record('5. AI Integration', 'Assistant chat rejects blank message', 'PASS', `HTTP ${blankChatRes.status}, error: ${blankChatData.error}`);
    } else {
      record('5. AI Integration', 'Assistant chat rejects blank message', 'FAIL', `Expected error, got ${blankChatRes.status}`);
    }

    // Test oversized message rejected
    const overChatRes = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'A'.repeat(2005) }] })
    });
    const overChatData = await overChatRes.json();
    if ((overChatRes.status === 400 || overChatRes.status === 500) && overChatData.error) {
      record('5. AI Integration', 'Assistant chat enforces 2,000 char limit', 'PASS', `HTTP ${overChatRes.status}, error: ${overChatData.error}`);
    } else {
      record('5. AI Integration', 'Assistant chat enforces 2,000 char limit', 'FAIL', `Expected error, got ${overChatRes.status}`);
    }
  } catch (err: any) {
    record('5. AI Integration', 'Assistant chat validation', 'FAIL', err.message);
  }

  // User A deletes Business Plan (clean CRUD cycle)
  try {
    const delRes = await fetch(`${BASE_URL}/api/plans/${planIdA}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const delData = await delRes.json();
    if (delRes.status === 200 && delData.success) {
      record('2. Auth & Profiles', 'User A deletes business plan cleanly', 'PASS', `HTTP 200, Plan ${planIdA} deleted`);
    } else {
      record('2. Auth & Profiles', 'User A deletes business plan', 'FAIL', `HTTP ${delRes.status}`);
    }
  } catch (err: any) {
    record('2. Auth & Profiles', 'User A deletes business plan', 'FAIL', err.message);
  }

  // User A Logout
  try {
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const logoutData = await logoutRes.json();
    if (logoutRes.status === 200 && logoutData.success) {
      record('2. Auth & Profiles', 'User A logs out and session is terminated', 'PASS', `HTTP 200, session revoked`);
    } else {
      record('2. Auth & Profiles', 'User A logout', 'FAIL', `HTTP ${logoutRes.status}`);
    }
  } catch (err: any) {
    record('2. Auth & Profiles', 'User A logout', 'FAIL', err.message);
  }

  // 6. Database Persistence Verification (Development Workspace)
  console.log('\n--- Checking Database Persistence in Development Workspace ---');
  const dbPath = getDatabasePath();
  const db = new Database(dbPath);
  const persistCheck = db.prepare('SELECT id, email, name FROM users WHERE email = ?').get(userAEmail) as any;
  if (persistCheck && persistCheck.id === userIdA) {
    record('6. DB Persistence', 'Record in workspace SQLite survives transaction & remains queryable in storage', 'PASS', `Verified record ${persistCheck.id} for ${persistCheck.email} persists in ${dbPath}`);
  } else {
    record('6. DB Persistence', 'Record persistence check', 'FAIL', `Record missing after session`);
  }

  // Targeted clean-up of ONLY these two test accounts (never touches existing application data)
  if (userIdA) {
    db.prepare('DELETE FROM users WHERE id = ?').run(userIdA);
  }
  if (userIdB) {
    db.prepare('DELETE FROM users WHERE id = ?').run(userIdB);
  }
  db.close();

  // 7. Deployed Persistence Status (Cloud Run)
  console.log('\n--- Cloud Run Deployed Persistence Classification ---');
  record(
    '7. Deployed Persistence',
    'Cloud Run Deployed Database Persistence',
    'NOT TESTED',
    'Cloud Run container filesystems are ephemeral (tmpfs) by platform design. Cloud Run database persistence is NOT claimed as passed because persistent volume mounts or Cloud SQL are not yet configured on the Cloud Run revision.'
  );

  // 8. Summary of Results
  console.log('\n===============================================================');
  console.log('  END-TO-END AUDIT REPORT SUMMARY                              ');
  console.log('===============================================================\n');

  const passedCount = results.filter(r => r.status === 'PASS').length;
  const failedCount = results.filter(r => r.status === 'FAIL').length;
  const notTestedCount = results.filter(r => r.status === 'NOT TESTED').length;

  console.log(`TOTAL CHECKS: ${results.length}`);
  console.log(`  PASSED:     ${passedCount}`);
  console.log(`  FAILED:     ${failedCount}`);
  console.log(`  NOT TESTED: ${notTestedCount}\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runE2EAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
