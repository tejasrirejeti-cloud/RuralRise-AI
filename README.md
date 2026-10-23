# RuralRise AI — Grounded Rural Entrepreneurship Intelligence Platform

**Pilot Geography**: Warangal District, Telangana, India  
**Stack**: React 19, TypeScript, Vite, Tailwind CSS, Express, Node.js, SQLite (`better-sqlite3`), `@google/genai` (Gemini 3.8 Flash).

---

## 1. Overview

RuralRise AI is an evidence-grounded micro-enterprise intelligence and launch navigation platform designed specifically for rural entrepreneurs, self-help groups (SHGs), and youth in Warangal District, Telangana.

Unlike generic business tools, every recommendation in RuralRise AI separates:
- **Verified Ground Facts**: Sourced directly from official portals (Enumamula Agricultural Market Yard, KVIC PMEGP, MoFPI PMFME, Telangana Open Data, GI Registry of India).
- **Engineering Assumptions**: Real-world rated machine throughput, power draw, and standard conversion losses.
- **Missing Field Factors**: Checklists of on-the-ground verifications (e.g. 3-phase power availability, physical shed condition, local groundwater) required before committing capital.

---

## 2. Key Capabilities

1. **Evidence-to-Decision Engine**:
   - Curated Warangal micro-enterprise catalog (Chilli & Turmeric Mini-Processing, Cotton Waste Briquetting, Dairy & Chilling, Handloom Dhurries, Rural Digital Citizen Center, Agri-Implement Repair).
   - Traceable government datasets, dated observations, and official portal links.
2. **Feasibility & Resilience Simulator**:
   - 100% deterministic financial model (requires zero AI credentials to operate).
   - 12-month seasonal cash flow projections and adverse shock stress testing (volume drops, input price spikes, machine downtime, credit delays).
   - Clear mathematical formula breakdowns for CAPEX, OPEX, contribution margin, and break-even units.
3. **Idea-to-Launch Navigator**:
   - 5-stage ground readiness checklist with live progress meter.
   - Bank project report generator ready for DIC / bank appraisal.
   - Optional server-side AI plan refinement via Gemini 3.8 Flash.
4. **RuralRise AI Entrepreneurship Assistant**:
   - Responsive floating chatbot available across all 9 pages on mobile and desktop.
   - Grounded in official Warangal market evidence and government schemes.
   - Bilingual (English and Telugu).
   - Strict privacy: No chat logs stored permanently by default; zero credential leakage.
   - Voice speech-to-text input support.
5. **Government Schemes & Subsidies Directory**:
   - Central & Telangana state schemes: PMEGP (up to 35% subsidy), PMFME (ODOP 35% capital subsidy for Chilli), T-PRIDE (35% for SC/ST with power subsidy), Mudra Shishu/Kishore.
   - Direct official links to `kviconline.gov.in`, `pmfme.mofpi.gov.in`, `ipass.telangana.gov.in`, `mudra.org.in`.
   - Contact details for DIC Warangal at Subedari, Hanamkonda (Ph: 0870-2577626).

---

## 3. Security Architecture

- **Password Hashing**: PBKDF2 with HMAC-SHA512, 100,000 iterations, 16-byte cryptographically secure salt. Transparent legacy upgrade from 12k to 100k iterations on login.
- **Credential Hygiene**: Public API responses (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`) strictly exclude salts and password hashes.
- **Session Security**: Cryptographically signed 64-character bearer tokens with HMAC-SHA256 signatures validated via `SESSION_SECRET` (strictly enforced >= 32 chars in production).
- **Password Recovery**: Single-use 64-character hex tokens stored only as SHA-256 hashes in SQLite. Plaintext tokens are never stored and never returned in API responses. Session revocation invalidates all pre-existing sessions upon reset.
- **Per-User Isolation**: User-specific database records (business plans, saved opportunities, calculator snapshots) are strictly enforced by `userId` queries. Cross-account access returns 404/400.
- **Rate Limiting**: Persistent SQLite-backed rate limiting with automated TTL cleanup across authentication, password recovery, AI refinement, audio transcription, and conversational assistant. Real client IPs tracked safely via `trust proxy`.
- **AI Privacy & Grounding**: Passwords, session tokens, and raw credentials are never transmitted to Gemini. Missing API credentials return truthful 503 notifications without fabricating mock text. Supported models: `gemini-3.8-flash` for chat and plan refinement, and `gemini-3.5-transcribe` for voice input.

---

## 4. Database & Persistence Model

- **Workspace / Local Environment**:
  - Native SQLite using `better-sqlite3` with Write-Ahead Logging (`PRAGMA journal_mode = WAL`) enabled.
  - Database file location: `data/ruralrise.sqlite` (configurable via `DATABASE_PATH`).
  - Schema auto-initializes on startup or via `npm run db:init`.
  - Sensitive files (`data/*.sqlite*`, `data/*.wal`, `data/*.shm`) are excluded from version control and release archives.
- **Clean Database Initialization**:
  - Run `npm run db:init` to prepare clean tables without any test or mock user records.
- **Cloud Run / Production Deployment Notice**:
  - Container filesystems in Cloud Run are ephemeral (`tmpfs`). Container restarts and new revision deployments reset local files.
  - For permanent multi-instance production persistence, use **Cloud SQL (PostgreSQL)** or attach a persistent Cloud Storage volume via Cloud Run Volume Mounts (GCS FUSE) mounted to `/app/applet/data`.
  - Database health and write readiness is reported via `/api/health`.

---

## 5. Getting Started & Development

### Prerequisites
- Node.js >= 20.0.0
- npm >= 9.0.0

### Installation
```bash
npm install
npm run db:init
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Key configuration items:
- `SESSION_SECRET`: At least 32 random characters (required in production).
- `GEMINI_API_KEY`: Google Gemini API key for assistant and plan refinement.
- `SMTP_*` or `RESEND_API_KEY`: Optional email provider for password reset delivery.
- `DATABASE_PATH`: Custom path for SQLite database file (optional).

### Running in Development
```bash
npm run dev
```
Starts the full-stack server on `http://localhost:3000`.

### Running Automated Test Suites
```bash
# Core security, persistence, rate limiting, calculator & grounding tests (102 assertions)
npm test

# Clean database initialization
npm run db:init

# Full end-to-end integration audit with simulated HTTP clients
npx tsx tests/e2e-audit.ts

# TypeScript type checks
npm run lint

# Production build
npm run build
```

---

## 6. Troubleshooting

- **Server fails with "SESSION_SECRET must be at least 32 characters"**:
  Set a secure 32+ character random string in your `.env` or production environment.
- **Assistant replies with "GEMINI_API_KEY is not configured"**:
  Set `GEMINI_API_KEY` in `.env`. The app gracefully runs all other features (calculator, catalog, schemes, plans) without the key.
- **Password reset reports "email not dispatched"**:
  Configure SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) or `RESEND_API_KEY`.
