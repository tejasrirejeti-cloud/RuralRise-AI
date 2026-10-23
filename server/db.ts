/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Database from 'better-sqlite3';
import { User, UserProfile, Opportunity, BusinessPlan, FinancialInputs, FinancialEvaluation } from '../src/types/index.js';
import { WARANGAL_OPPORTUNITIES } from './data/warangalData.js';
import { getSessionSecret, getDatabasePath } from './config.js';

export interface UserRecord extends User {
  passwordHash: string;
  salt: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  expiresAt: number;
  createdAt: string;
}

export interface SavedOpportunityRecord {
  id: string;
  userId: string;
  opportunityId: string;
  savedAt: string;
  notes?: string;
}

export interface CalculatorSnapshotRecord {
  id: string;
  userId: string;
  name: string;
  inputs: FinancialInputs;
  results: FinancialEvaluation;
  createdAt: string;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.resolve(DB_DIR, 'ruralrise.sqlite');

class SQLiteDatabase {
  private db: Database.Database;

  constructor(customPath?: string) {
    const targetPath = customPath || getDatabasePath();
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.db = new Database(targetPath);
    this.initPragmas();
    this.runMigrations();
  }

  private initPragmas(): void {
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.db.pragma('synchronous = NORMAL');
  }

  private runMigrations(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `);

    const row = this.db.prepare('SELECT MAX(version) as max_version FROM schema_migrations').get() as { max_version: number | null };
    const currentVersion = row?.max_version || 0;

    if (currentVersion < 1) {
      this.db.transaction(() => {
        // Users Table
        this.db.exec(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );
          CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        `);

        // Sessions Table
        this.db.exec(`
          CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            expires_at INTEGER NOT NULL,
            created_at TEXT NOT NULL
          );
          CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
          CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
        `);

        // Profiles Table
        this.db.exec(`
          CREATE TABLE IF NOT EXISTS profiles (
            user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            state TEXT NOT NULL DEFAULT 'Telangana',
            district TEXT NOT NULL DEFAULT 'Warangal',
            mandal TEXT NOT NULL,
            village TEXT,
            preferred_language TEXT NOT NULL DEFAULT 'en',
            skills TEXT NOT NULL,
            business_interests TEXT NOT NULL,
            starting_budget INTEGER NOT NULL DEFAULT 50000,
            budget_tier TEXT NOT NULL DEFAULT 'micro_under_50k',
            resources TEXT NOT NULL,
            time_available TEXT NOT NULL DEFAULT 'full_time',
            existing_business TEXT NOT NULL DEFAULT 'none',
            business_goals TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );
        `);

        // Saved Opportunities Table
        this.db.exec(`
          CREATE TABLE IF NOT EXISTS saved_opportunities (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            opportunity_id TEXT NOT NULL,
            saved_at TEXT NOT NULL,
            notes TEXT,
            UNIQUE(user_id, opportunity_id)
          );
          CREATE INDEX IF NOT EXISTS idx_saved_opps_user_id ON saved_opportunities(user_id);
        `);

        // Business Plans Table
        this.db.exec(`
          CREATE TABLE IF NOT EXISTS business_plans (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            opportunity_id TEXT,
            title TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'draft',
            concept TEXT NOT NULL,
            market TEXT NOT NULL,
            operations TEXT NOT NULL,
            financials TEXT NOT NULL,
            risks_and_mitigations TEXT NOT NULL,
            milestones TEXT NOT NULL,
            applicable_schemes TEXT NOT NULL,
            ai_refinement TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );
          CREATE INDEX IF NOT EXISTS idx_plans_user_id ON business_plans(user_id);
        `);

        // Calculator Snapshots Table
        this.db.exec(`
          CREATE TABLE IF NOT EXISTS calculator_snapshots (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            inputs TEXT NOT NULL,
            results TEXT NOT NULL,
            created_at TEXT NOT NULL
          );
          CREATE INDEX IF NOT EXISTS idx_calc_user_id ON calculator_snapshots(user_id);
        `);

        // Password Reset Tokens Table
        this.db.exec(`
          CREATE TABLE IF NOT EXISTS password_resets (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            expires_at INTEGER NOT NULL,
            created_at TEXT NOT NULL
          );
        `);

        this.db.prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (1, ?)').run(new Date().toISOString());
      })();
    }

    if (currentVersion < 2) {
      this.db.transaction(() => {
        try {
          this.db.exec(`ALTER TABLE business_plans ADD COLUMN launch_checklist TEXT;`);
        } catch {
          // column may already exist
        }
        try {
          this.db.exec(`ALTER TABLE business_plans ADD COLUMN feasibility_snapshot TEXT;`);
        } catch {
          // column may already exist
        }
        this.db.prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (2, ?)').run(new Date().toISOString());
      })();
    }

    if (currentVersion < 3) {
      this.db.transaction(() => {
        this.db.exec(`
          CREATE TABLE IF NOT EXISTS rate_limits (
            key TEXT PRIMARY KEY,
            count INTEGER NOT NULL,
            reset_at INTEGER NOT NULL
          );
          CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);
        `);
        this.db.prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (3, ?)').run(new Date().toISOString());
      })();
    }
  }

  public static validatePasswordStrength(password: string): void {
    if (!password || typeof password !== 'string') {
      throw new Error('Password is required.');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    if (password.trim().length === 0) {
      throw new Error('Password cannot be composed solely of whitespace.');
    }
  }

  private hashPassword(password: string, salt: string, iterations: number = 100000): string {
    return crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  }

  // --- Auth & Users ---
  public registerUser(name: string, email: string, passwordPlain: string): { user: User; token: string } {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw new Error('A valid email address is required.');
    }

    SQLiteDatabase.validatePasswordStrength(passwordPlain);

    const trimmedName = name.trim() || 'Rural Entrepreneur';

    const existing = this.db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(passwordPlain, salt, 100000);
    const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();

    const insertUser = this.db.prepare(`
      INSERT INTO users (id, email, name, password_hash, salt, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertSession = this.db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const signature = crypto.createHmac('sha256', getSessionSecret()).update(rawToken).digest('hex');
    const token = `${rawToken}.${signature}`;
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 days

    this.db.transaction(() => {
      insertUser.run(userId, normalizedEmail, trimmedName, passwordHash, salt, now, now);
      insertSession.run(token, userId, expiresAt, now);
    })();

    return {
      user: {
        id: userId,
        email: normalizedEmail,
        name: trimmedName,
        createdAt: now
      },
      token
    };
  }

  public loginUser(email: string, passwordPlain: string): { user: User; token: string } {
    const normalizedEmail = email.trim().toLowerCase();
    const row = this.db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail) as any;
    if (!row) {
      throw new Error('Invalid email or password.');
    }

    let authenticated = false;
    let needsRehash = false;

    // Check modern 100,000 iterations
    const testHash100k = this.hashPassword(passwordPlain, row.salt, 100000);
    const hashBuffer = Buffer.from(testHash100k, 'hex');
    const dbHashBuffer = Buffer.from(row.password_hash, 'hex');

    if (hashBuffer.length === dbHashBuffer.length && crypto.timingSafeEqual(hashBuffer, dbHashBuffer)) {
      authenticated = true;
    } else {
      // Backward compatibility check for legacy 12,000 iterations
      const testHashLegacy = this.hashPassword(passwordPlain, row.salt, 12000);
      const legacyBuffer = Buffer.from(testHashLegacy, 'hex');
      if (legacyBuffer.length === dbHashBuffer.length && crypto.timingSafeEqual(legacyBuffer, dbHashBuffer)) {
        authenticated = true;
        needsRehash = true;
      }
    }

    if (!authenticated) {
      throw new Error('Invalid email or password.');
    }

    // Transparently upgrade legacy hash to 100,000 iterations upon verified login
    if (needsRehash) {
      const newSalt = crypto.randomBytes(16).toString('hex');
      const upgradedHash = this.hashPassword(passwordPlain, newSalt, 100000);
      const now = new Date().toISOString();
      this.db.prepare('UPDATE users SET password_hash = ?, salt = ?, updated_at = ? WHERE id = ?')
        .run(upgradedHash, newSalt, now, row.id);
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const signature = crypto.createHmac('sha256', getSessionSecret()).update(rawToken).digest('hex');
    const token = `${rawToken}.${signature}`;
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30;
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(token, row.id, expiresAt, now);

    return {
      user: {
        id: row.id,
        email: row.email,
        name: row.name,
        createdAt: row.created_at
      },
      token
    };
  }

  public logoutUser(token: string): boolean {
    if (!token) return false;
    const info = this.db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return info.changes > 0;
  }

  public getUserByToken(token: string): { user: User; profile: UserProfile | null } | null {
    if (!token) return null;

    if (token.includes('.')) {
      const [raw, sig] = token.split('.');
      const expected = crypto.createHmac('sha256', getSessionSecret()).update(raw).digest('hex');
      if (sig !== expected) {
        return null;
      }
    }

    const session = this.db.prepare('SELECT * FROM sessions WHERE token = ?').get(token) as any;
    if (!session) return null;

    if (session.expires_at < Date.now()) {
      this.db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
      return null;
    }

    const userRow = this.db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(session.user_id) as any;
    if (!userRow) return null;

    const user: User = {
      id: userRow.id,
      email: userRow.email,
      name: userRow.name,
      createdAt: userRow.created_at
    };

    const profile = this.getProfile(userRow.id);

    return { user, profile };
  }

  public deleteUserAccount(userId: string): boolean {
    // Foreign keys with CASCADE will automatically delete sessions, profiles, saved opportunities, business plans, and snapshots
    const info = this.db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    return info.changes > 0;
  }

  public createPasswordResetToken(email: string): string | null {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail) as { id: string } | undefined;
    if (!user) return null;

    // Cryptographically secure, short-lived (15 minutes), single-use token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = Date.now() + 1000 * 60 * 15; // 15 minutes
    const now = new Date().toISOString();

    this.db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(user.id);
    this.db.prepare(`
      INSERT INTO password_resets (token, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(tokenHash, user.id, expiresAt, now);

    return rawToken;
  }

  public resetPasswordWithToken(rawToken: string, newPasswordPlain: string): boolean {
    if (!rawToken || typeof rawToken !== 'string') {
      throw new Error('Valid recovery token is required.');
    }

    SQLiteDatabase.validatePasswordStrength(newPasswordPlain);

    const tokenHash = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
    
    // Look up hashed token (and fallback to rawToken for backward compatibility)
    const reset = this.db.prepare('SELECT * FROM password_resets WHERE token = ? OR token = ?').get(tokenHash, rawToken.trim()) as any;
    if (!reset) {
      throw new Error('Invalid or expired password reset token.');
    }

    if (reset.expires_at < Date.now()) {
      this.db.prepare('DELETE FROM password_resets WHERE token = ?').run(reset.token);
      throw new Error('This password reset token has expired (15 minute validity). Please request a new recovery link.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(newPasswordPlain, salt, 100000);
    const now = new Date().toISOString();

    this.db.transaction(() => {
      // 1. Update password with fresh salt & 100k-iteration PBKDF2 hash
      this.db.prepare('UPDATE users SET password_hash = ?, salt = ?, updated_at = ? WHERE id = ?').run(passwordHash, salt, now, reset.user_id);
      // 2. Invalidate single-use reset token immediately
      this.db.prepare('DELETE FROM password_resets WHERE token = ?').run(reset.token);
      // 3. Invalidate all active sessions for this user (session rotation/revocation)
      this.db.prepare('DELETE FROM sessions WHERE user_id = ?').run(reset.user_id);
    })();

    return true;
  }

  // --- Profiles ---
  public getProfile(userId: string): UserProfile | null {
    const row = this.db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId) as any;
    if (!row) return null;

    try {
      return {
        userId: row.user_id,
        state: row.state,
        district: row.district,
        mandal: row.mandal,
        village: row.village || undefined,
        preferredLanguage: row.preferred_language,
        skills: JSON.parse(row.skills),
        businessInterests: JSON.parse(row.business_interests),
        startingBudget: row.starting_budget,
        budgetTier: row.budget_tier,
        resources: JSON.parse(row.resources),
        timeAvailable: row.time_available,
        existingBusiness: row.existing_business,
        businessGoals: JSON.parse(row.business_goals),
        updatedAt: row.updated_at
      };
    } catch {
      return null;
    }
  }

  public upsertProfile(userId: string, profileData: Partial<UserProfile>): UserProfile {
    const current = this.getProfile(userId);
    const now = new Date().toISOString();

    const merged: UserProfile = {
      userId,
      state: 'Telangana',
      district: 'Warangal',
      mandal: profileData.mandal || current?.mandal || 'Warangal (Urban)',
      village: profileData.village !== undefined ? profileData.village : current?.village,
      preferredLanguage: profileData.preferredLanguage || current?.preferredLanguage || 'en',
      skills: profileData.skills || current?.skills || [],
      businessInterests: profileData.businessInterests || current?.businessInterests || [],
      startingBudget: Number(profileData.startingBudget) || current?.startingBudget || 50000,
      budgetTier: profileData.budgetTier || current?.budgetTier || 'micro_under_50k',
      resources: profileData.resources || current?.resources || {
        hasLand: false,
        hasWorkspace: false,
        hasVehicle: false,
        hasSmartphone: true,
        hasThreePhasePower: false,
        familyWorkersCount: 1
      },
      timeAvailable: profileData.timeAvailable || current?.timeAvailable || 'full_time',
      existingBusiness: profileData.existingBusiness || current?.existingBusiness || 'none',
      businessGoals: profileData.businessGoals || current?.businessGoals || [],
      updatedAt: now
    };

    const stmt = this.db.prepare(`
      INSERT INTO profiles (
        user_id, state, district, mandal, village, preferred_language,
        skills, business_interests, starting_budget, budget_tier,
        resources, time_available, existing_business, business_goals, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        state = excluded.state,
        district = excluded.district,
        mandal = excluded.mandal,
        village = excluded.village,
        preferred_language = excluded.preferred_language,
        skills = excluded.skills,
        business_interests = excluded.business_interests,
        starting_budget = excluded.starting_budget,
        budget_tier = excluded.budget_tier,
        resources = excluded.resources,
        time_available = excluded.time_available,
        existing_business = excluded.existing_business,
        business_goals = excluded.business_goals,
        updated_at = excluded.updated_at
    `);

    stmt.run(
      merged.userId,
      merged.state,
      merged.district,
      merged.mandal,
      merged.village || null,
      merged.preferredLanguage,
      JSON.stringify(merged.skills),
      JSON.stringify(merged.businessInterests),
      merged.startingBudget,
      merged.budgetTier,
      JSON.stringify(merged.resources),
      merged.timeAvailable,
      merged.existingBusiness,
      JSON.stringify(merged.businessGoals),
      now
    );

    return merged;
  }

  // --- Saved Opportunities (Per-User Isolation) ---
  public getSavedOpportunities(userId: string): Array<{ record: SavedOpportunityRecord; opportunity: Opportunity }> {
    const rows = this.db.prepare('SELECT * FROM saved_opportunities WHERE user_id = ? ORDER BY saved_at DESC').all(userId) as any[];
    const results: Array<{ record: SavedOpportunityRecord; opportunity: Opportunity }> = [];

    for (const r of rows) {
      const opp = WARANGAL_OPPORTUNITIES.find(o => o.id === r.opportunity_id);
      if (opp) {
        results.push({
          record: {
            id: r.id,
            userId: r.user_id,
            opportunityId: r.opportunity_id,
            savedAt: r.saved_at,
            notes: r.notes || undefined
          },
          opportunity: opp
        });
      }
    }

    return results;
  }

  public saveOpportunity(userId: string, opportunityId: string, notes?: string): SavedOpportunityRecord {
    const existing = this.db.prepare('SELECT * FROM saved_opportunities WHERE user_id = ? AND opportunity_id = ?').get(userId, opportunityId) as any;
    const now = new Date().toISOString();

    if (existing) {
      if (notes !== undefined) {
        this.db.prepare('UPDATE saved_opportunities SET notes = ? WHERE id = ?').run(notes, existing.id);
      }
      return {
        id: existing.id,
        userId: existing.user_id,
        opportunityId: existing.opportunity_id,
        savedAt: existing.saved_at,
        notes: notes !== undefined ? notes : existing.notes
      };
    }

    const id = `so_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    this.db.prepare(`
      INSERT INTO saved_opportunities (id, user_id, opportunity_id, saved_at, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, opportunityId, now, notes || null);

    return { id, userId, opportunityId, savedAt: now, notes };
  }

  public removeSavedOpportunity(userId: string, opportunityIdOrRecordId: string): boolean {
    const info = this.db.prepare(`
      DELETE FROM saved_opportunities 
      WHERE user_id = ? AND (opportunity_id = ? OR id = ?)
    `).run(userId, opportunityIdOrRecordId, opportunityIdOrRecordId);
    return info.changes > 0;
  }

  // --- Business Plans (Per-User Isolation) ---
  public getBusinessPlans(userId: string): BusinessPlan[] {
    const rows = this.db.prepare('SELECT * FROM business_plans WHERE user_id = ? ORDER BY updated_at DESC').all(userId) as any[];
    return rows.map(r => {
      const checklist = r.launch_checklist ? JSON.parse(r.launch_checklist) : undefined;
      const completedCount = checklist ? checklist.filter((i: any) => i.completed).length : 0;
      const totalCount = checklist ? checklist.length : 0;
      const readiness = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      return {
        id: r.id,
        userId: r.user_id,
        opportunityId: r.opportunity_id || undefined,
        title: r.title,
        status: r.status,
        concept: JSON.parse(r.concept),
        market: JSON.parse(r.market),
        operations: JSON.parse(r.operations),
        financials: JSON.parse(r.financials),
        risksAndMitigations: JSON.parse(r.risks_and_mitigations),
        milestones: JSON.parse(r.milestones),
        applicableSchemes: JSON.parse(r.applicable_schemes),
        launchChecklist: checklist,
        launchReadinessPercent: readiness,
        feasibilitySnapshot: r.feasibility_snapshot ? JSON.parse(r.feasibility_snapshot) : undefined,
        aiRefinement: r.ai_refinement ? JSON.parse(r.ai_refinement) : undefined,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      };
    });
  }

  public getBusinessPlanById(userId: string, planId: string): BusinessPlan | null {
    const r = this.db.prepare('SELECT * FROM business_plans WHERE id = ? AND user_id = ?').get(planId, userId) as any;
    if (!r) return null;

    const checklist = r.launch_checklist ? JSON.parse(r.launch_checklist) : undefined;
    const completedCount = checklist ? checklist.filter((i: any) => i.completed).length : 0;
    const totalCount = checklist ? checklist.length : 0;
    const readiness = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      id: r.id,
      userId: r.user_id,
      opportunityId: r.opportunity_id || undefined,
      title: r.title,
      status: r.status,
      concept: JSON.parse(r.concept),
      market: JSON.parse(r.market),
      operations: JSON.parse(r.operations),
      financials: JSON.parse(r.financials),
      risksAndMitigations: JSON.parse(r.risks_and_mitigations),
      milestones: JSON.parse(r.milestones),
      applicableSchemes: JSON.parse(r.applicable_schemes),
      launchChecklist: checklist,
      launchReadinessPercent: readiness,
      feasibilitySnapshot: r.feasibility_snapshot ? JSON.parse(r.feasibility_snapshot) : undefined,
      aiRefinement: r.ai_refinement ? JSON.parse(r.ai_refinement) : undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }

  public createBusinessPlan(userId: string, plan: Omit<BusinessPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): BusinessPlan {
    const planId = `bp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO business_plans (
        id, user_id, opportunity_id, title, status,
        concept, market, operations, financials,
        risks_and_mitigations, milestones, applicable_schemes,
        launch_checklist, feasibility_snapshot,
        ai_refinement, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      planId,
      userId,
      plan.opportunityId || null,
      plan.title.trim() || 'Untitled Business Plan',
      plan.status || 'draft',
      JSON.stringify(plan.concept),
      JSON.stringify(plan.market),
      JSON.stringify(plan.operations),
      JSON.stringify(plan.financials),
      JSON.stringify(plan.risksAndMitigations || []),
      JSON.stringify(plan.milestones || []),
      JSON.stringify(plan.applicableSchemes || []),
      plan.launchChecklist ? JSON.stringify(plan.launchChecklist) : null,
      plan.feasibilitySnapshot ? JSON.stringify(plan.feasibilitySnapshot) : null,
      plan.aiRefinement ? JSON.stringify(plan.aiRefinement) : null,
      now,
      now
    );

    const checklist = plan.launchChecklist;
    const completedCount = checklist ? checklist.filter((i: any) => i.completed).length : 0;
    const totalCount = checklist ? checklist.length : 0;
    const readiness = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      ...plan,
      launchReadinessPercent: readiness,
      id: planId,
      userId,
      createdAt: now,
      updatedAt: now
    };
  }

  public updateBusinessPlan(userId: string, planId: string, updates: Partial<BusinessPlan>): BusinessPlan {
    const current = this.getBusinessPlanById(userId, planId);
    if (!current) {
      throw new Error('Business plan not found or unauthorized access.');
    }

    const checklist = updates.launchChecklist !== undefined ? updates.launchChecklist : current.launchChecklist;
    const completedCount = checklist ? checklist.filter((i: any) => i.completed).length : 0;
    const totalCount = checklist ? checklist.length : 0;
    const readiness = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const merged: BusinessPlan = {
      ...current,
      ...updates,
      launchReadinessPercent: readiness,
      id: planId,
      userId,
      updatedAt: new Date().toISOString()
    };

    this.db.prepare(`
      UPDATE business_plans SET
        opportunity_id = ?,
        title = ?,
        status = ?,
        concept = ?,
        market = ?,
        operations = ?,
        financials = ?,
        risks_and_mitigations = ?,
        milestones = ?,
        applicable_schemes = ?,
        launch_checklist = ?,
        feasibility_snapshot = ?,
        ai_refinement = ?,
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      merged.opportunityId || null,
      merged.title,
      merged.status,
      JSON.stringify(merged.concept),
      JSON.stringify(merged.market),
      JSON.stringify(merged.operations),
      JSON.stringify(merged.financials),
      JSON.stringify(merged.risksAndMitigations),
      JSON.stringify(merged.milestones),
      JSON.stringify(merged.applicableSchemes),
      merged.launchChecklist ? JSON.stringify(merged.launchChecklist) : null,
      merged.feasibilitySnapshot ? JSON.stringify(merged.feasibilitySnapshot) : null,
      merged.aiRefinement ? JSON.stringify(merged.aiRefinement) : null,
      merged.updatedAt,
      planId,
      userId
    );

    return merged;
  }

  public deleteBusinessPlan(userId: string, planId: string): boolean {
    const info = this.db.prepare('DELETE FROM business_plans WHERE id = ? AND user_id = ?').run(planId, userId);
    return info.changes > 0;
  }

  // --- Calculator Snapshots ---
  public saveCalculatorSnapshot(userId: string, name: string, inputs: FinancialInputs, results: FinancialEvaluation): CalculatorSnapshotRecord {
    const id = `cs_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO calculator_snapshots (id, user_id, name, inputs, results, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId, name, JSON.stringify(inputs), JSON.stringify(results), now);

    return { id, userId, name, inputs, results, createdAt: now };
  }

  public getCalculatorSnapshots(userId: string): CalculatorSnapshotRecord[] {
    const rows = this.db.prepare('SELECT * FROM calculator_snapshots WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
    return rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      name: r.name,
      inputs: JSON.parse(r.inputs),
      results: JSON.parse(r.results),
      createdAt: r.created_at
    }));
  }

  public deleteCalculatorSnapshot(userId: string, snapshotId: string): boolean {
    const info = this.db.prepare('DELETE FROM calculator_snapshots WHERE id = ? AND user_id = ?').run(snapshotId, userId);
    return info.changes > 0;
  }

  // --- Transparent Rule-Based Match Scoring ---
  public scoreOpportunityForProfile(opportunity: Opportunity, profile?: UserProfile): Opportunity {
    if (!profile) {
      return opportunity;
    }

    let score = 50; // Neutral baseline
    const matchReasonsEn: string[] = [];
    const matchReasonsTe: string[] = [];

    // 1. Budget Fit
    if (profile.startingBudget >= opportunity.minCapitalINR) {
      score += 20;
      matchReasonsEn.push(`Your stated starting capital (₹${profile.startingBudget.toLocaleString('en-IN')}) meets the baseline initial setup cost (₹${opportunity.minCapitalINR.toLocaleString('en-IN')}).`);
      matchReasonsTe.push(`మీ అందుబాటులో ఉన్న పెట్టుబడి (₹${profile.startingBudget.toLocaleString('en-IN')}) కనీస ప్రారంభ వ్యయానికి (₹${opportunity.minCapitalINR.toLocaleString('en-IN')}) సరిపోతుంది.`);
    } else if (profile.startingBudget >= opportunity.minCapitalINR * 0.6) {
      score += 10;
      matchReasonsEn.push(`Capital gap can be bridged using eligible central/state subsidies (e.g. PMEGP 35% margin or Mudra loan).`);
      matchReasonsTe.push(`మిగిలిన పెట్టుబడిని PMEGP 35% లేదా ముద్ర పథకం ద్వారా సమకూర్చుకోవచ్చు.`);
    } else {
      score -= 15;
      matchReasonsEn.push(`Opportunity requires ₹${opportunity.minCapitalINR.toLocaleString('en-IN')}, which exceeds your stated starting budget without substantial bank credit.`);
      matchReasonsTe.push(`ఈ వ్యాపారానికి ప్రారంభంలో ఎక్కువ పెట్టుబడి అవసరం.`);
    }

    // 2. Business Interests Alignment
    const userInterests = profile.businessInterests || [];
    const oppCategory = opportunity.category.toLowerCase();
    const oppSector = opportunity.sectorEn.toLowerCase();
    const oppTitle = opportunity.titleEn.toLowerCase();

    const matchesInterest = userInterests.some(interest => {
      const norm = interest.toLowerCase().trim();
      return oppCategory.includes(norm) || norm.includes(oppCategory) ||
             oppSector.includes(norm) || oppTitle.includes(norm);
    });

    if (matchesInterest) {
      score += 15;
      matchReasonsEn.push(`Directly matches your indicated business interest in ${opportunity.sectorEn}.`);
      matchReasonsTe.push(`మీరు ఎంచుకున్న ఆసక్తికి సరిపోతుంది: ${opportunity.sectorTe}.`);
    }

    // 3. Skill match
    const matchingSkills = opportunity.requiredSkills.filter(reqSkill =>
      profile.skills.some(userSkill => userSkill.toLowerCase().includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(userSkill.toLowerCase()))
    );

    if (matchingSkills.length > 0) {
      score += 15;
      matchReasonsEn.push(`Matches your skills in: ${matchingSkills.join(', ')}.`);
      matchReasonsTe.push(`మీకున్న నైపుణ్యాలు సరిపోతున్నాయి: ${matchingSkills.join(', ')}.`);
    }

    // 4. Business Goals & Demographics Alignment
    const userGoals = (profile.businessGoals || []).map(g => g.toLowerCase());

    const hasWomenShgGoal = userGoals.some(g => g.includes('women') || g.includes('shg') || g.includes('self_help') || g.includes('group'));
    if (hasWomenShgGoal && opportunity.applicableSchemes.some(s => s.toLowerCase().includes('shg') || s.toLowerCase().includes('stree') || s.toLowerCase().includes('pmegp'))) {
      score += 10;
      matchReasonsEn.push('Eligible for priority women entrepreneur assistance and SHG / Stree Nidhi group collateral-free financing.');
      matchReasonsTe.push('మహిళా సంఘాలు (SHG) మరియు స్త్రీనిధి పూచీకత్తు లేని రుణాలకు ఈ వ్యాపారం అర్హత కలిగి ఉంది.');
    }

    const hasValueAddGoal = userGoals.some(g => g.includes('value_addition') || g.includes('processing') || g.includes('local') || g.includes('manufacturing'));
    if (hasValueAddGoal && (opportunity.category === 'food_processing' || opportunity.category === 'handloom_crafts' || opportunity.category === 'agri_allied')) {
      score += 10;
      matchReasonsEn.push('Fulfills your goal of local agricultural/artisan value addition within Warangal production clusters.');
      matchReasonsTe.push('స్థానిక వ్యవసాయ మరియు చేనేత ఉత్పత్తుల విలువ పెంచే మీ లక్ష్యానికి సరిపోతుంది.');
    }

    const hasCashflowGoal = userGoals.some(g => g.includes('daily') || g.includes('cashflow') || g.includes('liquidity') || g.includes('quick'));
    if (hasCashflowGoal && (opportunity.category === 'digital_services' || opportunity.category === 'repair_maintenance')) {
      score += 8;
      matchReasonsEn.push('Generates direct daily transaction income, addressing your liquidity and regular cash flow goals.');
      matchReasonsTe.push('సేవా రుసుముల ద్వారా ప్రతిరోజూ నగదు రాబడిని అందించి మీ లక్ష్యానికి తోడ్పడుతుంది.');
    }

    // 5. Resource alignment
    if (opportunity.category === 'dairy_livestock' && profile.resources.hasLand) {
      score += 10;
      matchReasonsEn.push('Your available land provides open space for low-cost sheds and foraging.');
      matchReasonsTe.push('మీకున్న స్థలం పశువులు, కోళ్లు తిరగడానికి మరియు షెడ్డు వేయడానికి ఉపయోగపడుతుంది.');
    }

    if (opportunity.category === 'food_processing' && profile.resources.hasThreePhasePower) {
      score += 10;
      matchReasonsEn.push('Your premises has 3-phase electricity, suitable for commercial milling motors.');
      matchReasonsTe.push('మీ వద్ద 3-ఫేజ్ కరెంట్ ఉండటం వల్ల హెవీ మెషీన్లను నడపవచ్చు.');
    }

    if (profile.resources.hasVehicle) {
      score += 5;
      matchReasonsEn.push('Vehicle access facilitates delivery to mandal kirana stores and weekly shandies.');
      matchReasonsTe.push('వాహనం అందుబాటులో ఉండటం వల్ల గ్రామాలకు డెలివరీ సులభమవుతుంది.');
    }

    // 6. Locality proximity
    if (profile.mandal && opportunity.localWarangalAdvantageEn.toLowerCase().includes(profile.mandal.toLowerCase())) {
      score += 5;
      matchReasonsEn.push(`Specialized local production cluster active near ${profile.mandal}.`);
      matchReasonsTe.push(`${profile.mandal} పరిసర ప్రాంతాల్లో స్థానిక క్లస్టర్ మరియు డిమాండ్ ఉంది.`);
    }

    // 7. Time availability check
    if (profile.timeAvailable === 'part_time' && (opportunity.category === 'food_processing' || opportunity.category === 'handloom_crafts')) {
      score -= 10;
      matchReasonsEn.push('Caution: Commercial processing typically requires full-time oversight during harvest batches.');
      matchReasonsTe.push('గమనిక: ఈ వ్యాపారానికి పూర్తి సమయం కేటాయించాల్సి ఉంటుంది; పార్ట్ టైమ్ పని వల్ల ఉత్పత్తి పరిమితం కావచ్చు.');
    }

    // Clamp score between 20 and 98
    const finalScore = Math.max(20, Math.min(98, score));

    return {
      ...opportunity,
      suitabilityScore: finalScore,
      matchReasonsEn,
      matchReasonsTe
    };
  }

  public purgeTestAndDemoRecords(): { purgedUsers: number; purgedPlans: number } {
    try {
      const plansInfo = this.db.prepare(`
        DELETE FROM business_plans WHERE user_id IN (
          SELECT id FROM users WHERE email LIKE 'test_%' OR email LIKE '%demo%' OR email LIKE '%example.com%'
        )
      `).run();
      const usersInfo = this.db.prepare(`
        DELETE FROM users WHERE email LIKE 'test_%' OR email LIKE '%demo%' OR email LIKE '%example.com%'
      `).run();
      return { purgedUsers: usersInfo.changes, purgedPlans: plansInfo.changes };
    } catch {
      return { purgedUsers: 0, purgedPlans: 0 };
    }
  }

  // --- Rate Limiting with Automatic TTL Pruning ---
  public pruneExpiredRateLimits(now: number = Date.now()): number {
    try {
      const info = this.db.prepare('DELETE FROM rate_limits WHERE reset_at < ?').run(now);
      return info.changes;
    } catch {
      return 0;
    }
  }

  public checkAndIncrementRateLimit(
    key: string,
    maxRequests: number,
    windowMs: number
  ): { allowed: boolean; count: number; retryAfterSeconds: number } {
    const now = Date.now();
    // Prune expired records opportunistically
    this.pruneExpiredRateLimits(now);

    return this.db.transaction(() => {
      const record = this.db.prepare('SELECT count, reset_at FROM rate_limits WHERE key = ?').get(key) as
        | { count: number; reset_at: number }
        | undefined;

      if (!record || now >= record.reset_at) {
        const resetAt = now + windowMs;
        this.db.prepare(`
          INSERT INTO rate_limits (key, count, reset_at)
          VALUES (?, 1, ?)
          ON CONFLICT(key) DO UPDATE SET count = 1, reset_at = excluded.reset_at
        `).run(key, resetAt);
        return { allowed: true, count: 1, retryAfterSeconds: 0 };
      }

      if (record.count >= maxRequests) {
        const retryAfterSeconds = Math.ceil((record.reset_at - now) / 1000);
        return { allowed: false, count: record.count, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
      }

      const nextCount = record.count + 1;
      this.db.prepare('UPDATE rate_limits SET count = ? WHERE key = ?').run(nextCount, key);
      return { allowed: true, count: nextCount, retryAfterSeconds: 0 };
    })();
  }

  // --- Health & Readiness Check ---
  public healthCheck(): {
    healthy: boolean;
    tables: string[];
    userCount: number;
    dbPath: string;
    writable: boolean;
    error?: string;
  } {
    const targetPath = getDatabasePath();
    try {
      // 1. Verify schema tables exist
      const tableRows = this.db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        .all() as Array<{ name: string }>;
      const tables = tableRows.map(r => r.name);

      // 2. Verify basic read query
      const userCountRow = this.db.prepare('SELECT count(*) as count FROM users').get() as { count: number };

      // 3. Verify write ability via rate_limits touch
      const testKey = '__health_ping__';
      const now = Date.now();
      this.db.prepare(`
        INSERT INTO rate_limits (key, count, reset_at)
        VALUES (?, 1, ?)
        ON CONFLICT(key) DO UPDATE SET count = 1, reset_at = excluded.reset_at
      `).run(testKey, now + 1000);
      this.db.prepare('DELETE FROM rate_limits WHERE key = ?').run(testKey);

      return {
        healthy: true,
        tables,
        userCount: userCountRow.count,
        dbPath: targetPath,
        writable: true
      };
    } catch (err: any) {
      return {
        healthy: false,
        tables: [],
        userCount: 0,
        dbPath: targetPath,
        writable: false,
        error: err.message || 'Database check failed'
      };
    }
  }

  public close(): void {
    try {
      this.db.close();
    } catch {
      // already closed
    }
  }
}

export { SQLiteDatabase };
export const db = new SQLiteDatabase();
// Clean any leftover test records from production database on startup
if (process.env.NODE_ENV !== 'test') {
  db.purgeTestAndDemoRecords();
}
