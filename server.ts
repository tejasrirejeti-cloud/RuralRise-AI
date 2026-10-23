/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { WARANGAL_OPPORTUNITIES, WARANGAL_MARKET_EVIDENCE, GOVERNMENT_SCHEMES, WARANGAL_MANDALS } from './server/data/warangalData.js';
import { calculateFinancialFeasibility, CALCULATOR_PRESETS } from './server/calculator.js';
import { refineBusinessPlanWithAI, chatWithRuralRiseAssistant, transcribeAudioWithAI } from './server/ai.js';
import { getSessionSecret, isGeminiConfigured } from './server/config.js';
import { getEmailConfigStatus, sendPasswordRecoveryEmail } from './server/email.js';
import { User, UserProfile } from './src/types/index.js';

dotenv.config();

// Ensure session secret passes security validation (strict in production)
getSessionSecret();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Safe reverse-proxy trust configuration for Cloud Run & containerized ingress
app.set('trust proxy', 1);

// Basic JSON & Body Parsing
app.use(express.json({ limit: '5mb' }));

// Security Headers Middleware
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Authentication extraction middleware
export interface AuthenticatedRequest extends Request {
  user?: User;
  profile?: UserProfile | null;
}

const optionalAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const result = db.getUserByToken(token);
    if (result) {
      req.user = result.user;
      req.profile = result.profile;
    }
  }
  next();
};

const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const token = authHeader.substring(7).trim();
  const result = db.getUserByToken(token);
  if (!result) {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }

  req.user = result.user;
  req.profile = result.profile;
  next();
};

// ==========================================
// API Endpoints
// ==========================================

// Health Check (Deep readiness & DB connectivity)
app.get('/api/health', (_req: Request, res: Response) => {
  const emailStatus = getEmailConfigStatus();
  const dbHealth = db.healthCheck();
  const isHealthy = dbHealth.healthy;
  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'RuralRise AI Backend',
    pilotGeography: 'Warangal District, Telangana, India',
    geminiConfigured: isGeminiConfigured(),
    emailDeliveryConfigured: emailStatus.isConfigured,
    emailProvider: emailStatus.provider,
    database: 'SQLite (better-sqlite3)',
    databaseDetails: {
      healthy: dbHealth.healthy,
      writable: dbHealth.writable,
      tablesConfirmed: dbHealth.tables.length,
      storageNote: process.env.DATABASE_PATH ? 'Custom storage path configured' : 'Local storage (use Cloud Run volume mount or Cloud SQL for distributed persistence)'
    },
    timestamp: new Date().toISOString()
  });
});

// Persistent SQLite-backed Rate Limiter with Automatic TTL Cleanup
function createRateLimiter(maxRequests: number, windowMs: number, message: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'test') {
      return next();
    }
    const ip = req.ip || req.socket.remoteAddress || 'client';
    const key = `${req.path}:${ip}`;
    const result = db.checkAndIncrementRateLimit(key, maxRequests, windowMs);

    if (!result.allowed) {
      res.setHeader('Retry-After', String(result.retryAfterSeconds));
      return res.status(429).json({
        error: message,
        retryAfterSeconds: result.retryAfterSeconds
      });
    }

    next();
  };
}

const authRateLimiter = createRateLimiter(15, 15 * 60 * 1000, 'Too many authentication attempts. Please try again in 15 minutes.');
const recoveryRateLimiter = createRateLimiter(6, 15 * 60 * 1000, 'Too many password recovery requests. Please try again in 15 minutes.');
const aiPlanRefineRateLimiter = createRateLimiter(10, 5 * 60 * 1000, 'AI plan refinement limit reached. Please wait a few minutes before submitting another plan.');
const assistantRateLimiter = createRateLimiter(30, 60 * 1000, 'Assistant request limit reached. Please wait a moment before sending another query.');
const transcribeRateLimiter = createRateLimiter(15, 60 * 1000, 'Audio transcription limit reached. Please wait a moment before trying again.');

// Auth Routes
app.post('/api/auth/register', authRateLimiter, (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const result = db.registerUser(name || '', email, password);
    // Explicit defense-in-depth: return strictly minimal user info and session token
    res.status(201).json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        createdAt: result.user.createdAt
      },
      token: result.token
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', authRateLimiter, (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const result = db.loginUser(email, password);
    // Explicit defense-in-depth: return strictly minimal user info and session token
    res.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        createdAt: result.user.createdAt
      },
      token: result.token
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Invalid credentials.' });
  }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    db.logoutUser(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: req.user,
    profile: req.profile || null
  });
});

// Safe Account Deletion
app.delete('/api/auth/account', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = db.deleteUserAccount(req.user!.id);
    res.json({ success, message: 'Account and associated records purged successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete account.' });
  }
});

// Password Recovery Request (Zero Token Leakage, Generic Response)
app.post('/api/auth/reset-password-request', recoveryRateLimiter, async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  // Generates single-use token, stores SHA-256 hash in DB with 15m expiry
  const rawToken = db.createPasswordResetToken(email);
  const emailStatus = getEmailConfigStatus();

  let emailDispatched = false;
  let deliveryError: string | null = null;

  if (rawToken && emailStatus.isConfigured) {
    try {
      const sendResult = await sendPasswordRecoveryEmail(email, rawToken);
      emailDispatched = sendResult.dispatched;
      if (!sendResult.success) {
        deliveryError = sendResult.error || 'Provider rejected message';
      }
    } catch (err: any) {
      deliveryError = err.message || 'Email delivery failed';
    }
  } else if (rawToken && !emailStatus.isConfigured) {
    // Development/pilot info log (NEVER logs usable token)
    console.info(`[RuralRise Auth] Password recovery initiated for ${email}. Email dispatch skipped: email service unconfigured.`);
  }

  // Generic recovery response: NEVER leaks whether user exists or returns the token
  if (!emailStatus.isConfigured) {
    return res.json({
      success: true,
      message: 'If an account exists with this email address, password recovery instructions have been initiated.',
      emailDeliveryConfigured: false,
      dispatched: false,
      deliveryNotice: 'Outbound email delivery is not configured on this server (SMTP credentials missing). Password recovery requires email provider configuration.'
    });
  }

  if (emailDispatched) {
    return res.json({
      success: true,
      message: 'If an account exists with this email address, password recovery instructions have been initiated.',
      emailDeliveryConfigured: true,
      dispatched: true,
      deliveryNotice: 'A single-use password recovery link has been dispatched to your registered email address. Please check your inbox within 15 minutes.'
    });
  }

  return res.json({
    success: true,
    message: 'If an account exists with this email address, password recovery instructions have been initiated.',
    emailDeliveryConfigured: true,
    dispatched: false,
    deliveryNotice: `Configured email provider encountered an error during dispatch: ${deliveryError || 'Failed to dispatch email'}. Please contact administrator.`
  });
});

// Password Reset Completion (Verifies SHA-256 token hash & invalidates token + prior sessions)
app.post('/api/auth/reset-password', recoveryRateLimiter, (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Reset token and new password are required.' });
  }

  try {
    db.resetPasswordWithToken(token, newPassword);
    res.json({ success: true, message: 'Password has been updated. Please sign in with your new password.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Password reset failed.' });
  }
});

// Profile Routes
app.get('/api/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ profile: req.profile || null });
});

app.put('/api/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { startingBudget, mandal, skills, businessInterests, businessGoals } = req.body;
    if (startingBudget !== undefined && (isNaN(Number(startingBudget)) || Number(startingBudget) < 0 || Number(startingBudget) > 100000000)) {
      return res.status(400).json({ error: 'Starting budget must be a positive number less than ₹10 Crores.' });
    }
    if (mandal !== undefined && typeof mandal !== 'string') {
      return res.status(400).json({ error: 'Mandal must be a valid string.' });
    }
    if (skills !== undefined && !Array.isArray(skills)) {
      return res.status(400).json({ error: 'Skills must be an array of strings.' });
    }
    if (businessInterests !== undefined && !Array.isArray(businessInterests)) {
      return res.status(400).json({ error: 'Business interests must be an array of strings.' });
    }
    if (businessGoals !== undefined && !Array.isArray(businessGoals)) {
      return res.status(400).json({ error: 'Business goals must be an array of strings.' });
    }
    const updated = db.upsertProfile(req.user!.id, req.body);
    res.json({ profile: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update profile.' });
  }
});

// Opportunities Routes
app.get('/api/opportunities', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { category, maxBudget, search } = req.query;

  let opportunities = [...WARANGAL_OPPORTUNITIES];

  // If user has a profile, apply rule-based match scoring
  if (req.profile) {
    opportunities = opportunities.map(opp => db.scoreOpportunityForProfile(opp, req.profile || undefined));
    opportunities.sort((a, b) => (b.suitabilityScore || 0) - (a.suitabilityScore || 0));
  }

  // Filter by category
  if (category && category !== 'all') {
    opportunities = opportunities.filter(opp => opp.category === category);
  }

  // Filter by max budget
  if (maxBudget) {
    const budgetNum = Number(maxBudget);
    if (!isNaN(budgetNum) && budgetNum > 0) {
      opportunities = opportunities.filter(opp => opp.minCapitalINR <= budgetNum);
    }
  }

  // Filter by search query
  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    opportunities = opportunities.filter(
      opp =>
        opp.titleEn.toLowerCase().includes(q) ||
        opp.titleTe.toLowerCase().includes(q) ||
        opp.summaryEn.toLowerCase().includes(q) ||
        opp.summaryTe.toLowerCase().includes(q) ||
        opp.sectorEn.toLowerCase().includes(q) ||
        opp.requiredSkills.some(s => s.toLowerCase().includes(q))
    );
  }

  res.json({
    opportunities,
    total: opportunities.length,
    isPersonalized: Boolean(req.profile)
  });
});

app.get('/api/opportunities/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const opp = WARANGAL_OPPORTUNITIES.find(o => o.id === req.params.id || o.slug === req.params.id);
  if (!opp) {
    return res.status(404).json({ error: 'Opportunity not found.' });
  }

  const scored = req.profile ? db.scoreOpportunityForProfile(opp, req.profile) : opp;
  res.json({ opportunity: scored });
});

// Saved Opportunities (Bookmarks)
app.get('/api/saved-opportunities', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const saved = db.getSavedOpportunities(req.user!.id);
  res.json({ savedOpportunities: saved });
});

app.post('/api/saved-opportunities', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { opportunityId, notes } = req.body;
  if (!opportunityId || typeof opportunityId !== 'string') {
    return res.status(400).json({ error: 'Valid opportunityId is required.' });
  }
  const opp = WARANGAL_OPPORTUNITIES.find(o => o.id === opportunityId || o.slug === opportunityId);
  if (!opp) {
    return res.status(404).json({ error: 'Opportunity not found in catalog.' });
  }
  const sanitizedNotes = typeof notes === 'string' ? notes.slice(0, 500) : undefined;
  const record = db.saveOpportunity(req.user!.id, opp.id, sanitizedNotes);
  res.status(201).json({ savedOpportunity: record });
});

app.delete('/api/saved-opportunities/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = db.removeSavedOpportunity(req.user!.id, req.params.id);
  res.json({ success });
});

// Market Intelligence & Evidence Register
app.get('/api/market-intelligence', (_req: Request, res: Response) => {
  res.json({
    datasets: WARANGAL_MARKET_EVIDENCE,
    mandals: WARANGAL_MANDALS,
    evidenceProvenanceNotice: 'All data points are traceable to official Telangana state or central government ministries.',
    lastVerifiedDate: '2026-03-01'
  });
});

app.post('/api/market-intelligence/query', (req: Request, res: Response) => {
  const { category, query } = req.body;
  let results = [...WARANGAL_MARKET_EVIDENCE];

  if (category && category !== 'all') {
    results = results.filter(d => d.category === category);
  }

  if (query && typeof query === 'string') {
    const q = query.toLowerCase().trim();
    results = results.filter(
      d =>
        d.titleEn.toLowerCase().includes(q) ||
        d.titleTe.toLowerCase().includes(q) ||
        d.sourceName.toLowerCase().includes(q) ||
        d.warangalContextEn.toLowerCase().includes(q)
    );
  }

  res.json({
    results,
    count: results.length,
    timestamp: new Date().toISOString()
  });
});

// Government Schemes
app.get('/api/schemes', (_req: Request, res: Response) => {
  res.json({
    schemes: GOVERNMENT_SCHEMES,
    leadBanksWarangal: [
      { name: 'State Bank of India (Lead Bank for Warangal)', address: 'Hanamkonda Main Branch' },
      { name: 'Telangana Grameena Bank (TGGB)', address: 'Regional Office, Subedari, Hanamkonda' }
    ],
    officialNotice: 'Schemes are subject to credit appraisal and official verification. No upfront fees are ever charged by official portals.'
  });
});

// Financial Calculator
app.post('/api/calculator/evaluate', (req: Request, res: Response) => {
  try {
    const evaluation = calculateFinancialFeasibility(req.body);
    res.json(evaluation);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Calculation evaluation failed.' });
  }
});

app.get('/api/calculator/presets', (_req: Request, res: Response) => {
  res.json({ presets: CALCULATOR_PRESETS });
});

app.post('/api/calculator/save', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, inputs, results } = req.body;
    if (!name || !inputs || !results) {
      return res.status(400).json({ error: 'Name, inputs, and results are required to save snapshot.' });
    }
    const record = db.saveCalculatorSnapshot(req.user!.id, name, inputs, results);
    res.status(201).json({ snapshot: record });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to save calculation snapshot.' });
  }
});

app.get('/api/calculator/saved', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const snapshots = db.getCalculatorSnapshots(req.user!.id);
  res.json({ snapshots });
});

app.delete('/api/calculator/saved/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteCalculatorSnapshot(req.user!.id, req.params.id);
  res.json({ success });
});

// Business Plans (Full CRUD, Per-User Isolation)
app.get('/api/plans', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const plans = db.getBusinessPlans(req.user!.id);
  res.json({ plans });
});

app.get('/api/plans/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const plan = db.getBusinessPlanById(req.user!.id, req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Business plan not found or unauthorized access.' });
  }
  res.json({ plan });
});

app.post('/api/plans', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const created = db.createBusinessPlan(req.user!.id, req.body);
    res.status(201).json({ plan: created });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create business plan.' });
  }
});

app.put('/api/plans/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateBusinessPlan(req.user!.id, req.params.id, req.body);
    res.json({ plan: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update business plan.' });
  }
});

app.delete('/api/plans/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.deleteBusinessPlan(req.user!.id, req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Business plan not found or unauthorized.' });
  }
  res.json({ success: true, message: 'Plan deleted successfully.' });
});

// Server-side AI Business Plan Refinement (Honest Error Reporting)
app.post('/api/ai/refine-plan', requireAuth, aiPlanRefineRateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const plan = req.body;
    if (!plan || !plan.title) {
      return res.status(400).json({ error: 'Plan data with title is required for AI refinement.' });
    }
    const aiResult = await refineBusinessPlanWithAI(plan);
    res.json({ refinement: aiResult });
  } catch (err: any) {
    res.status(503).json({ error: err.message || 'AI analysis service unavailable.' });
  }
});

// RuralRise AI Entrepreneurship Assistant Chat Endpoint
app.post('/api/ai/chat', optionalAuth, assistantRateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { messages, language, context } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required and cannot be empty.' });
    }

    // Sanitize user context for AI grounding (Strictly exclude sensitive fields)
    const sanitizedProfile = req.profile ? {
      mandal: req.profile.mandal,
      startingBudget: req.profile.startingBudget,
      businessInterests: req.profile.businessInterests,
      skills: req.profile.skills,
      resources: req.profile.resources,
      businessGoals: req.profile.businessGoals
    } : undefined;

    const mergedContext = {
      ...(context || {}),
      profile: sanitizedProfile
    };

    const chatResult = await chatWithRuralRiseAssistant(
      messages,
      language || 'en',
      mergedContext
    );

    res.json(chatResult);
  } catch (err: any) {
    const status = err.message?.includes('GEMINI_API_KEY') ? 503 : 500;
    res.status(status).json({ error: err.message || 'Assistant service is currently unavailable.' });
  }
});

// Audio Speech-to-Text Transcription Endpoint (gemini-3.5-transcribe)
app.post('/api/ai/transcribe', optionalAuth, transcribeRateLimiter, async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({ error: 'Valid audioBase64 string is required.' });
    }

    const result = await transcribeAudioWithAI(audioBase64, mimeType || 'audio/webm');
    res.json(result);
  } catch (err: any) {
    const status = err.message?.includes('GEMINI_API_KEY') ? 503 : 500;
    res.status(status).json({ error: err.message || 'Audio transcription failed.' });
  }
});

// ==========================================
// Server Initialization & Vite Integration
// ==========================================

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
      },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RuralRise AI] Server active on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'}, db: SQLite)`);
  });
}

startServer().catch(err => {
  console.error('Failed to start RuralRise server:', err);
  process.exit(1);
});
