# GEMINI: Flowlary — Project Snapshot and Remake Plan

This document is a single-source reference for the current repository state, gaps discovered during review, and a prioritized, actionable plan to perform a major update / partial remake of Flowlary.

Keep this file as the onboarding + plan doc for any large refactor or rewrite. Use the steps below as checkboxes during work and update progress there.

--

### 1) High-level summary

- Purpose: privacy-first salary-driven personal finance app with an AI copilot.
- Stack (actual from repository): Next.js 16.2.3, React 19.2.4, TypeScript 5.x, TailwindCSS 3.x, Mongoose + MongoDB Atlas, NextAuth (Auth.js) v5, Groq via Vercel AI SDK.
- Architecture: **ledger-first** — all financial state is computed at write time by a posting service and stored in `MonthlySnapshot` documents. Read paths use stored values, not live recomputation. See [`docs/adr/0001-ledger-first-architecture.md`](docs/adr/0001-ledger-first-architecture.md).

### 2) Quick inventory (current state)

- `package.json`: project dependencies and exact versions (Next 16.2.3, React 19.2.4). See [package.json](package.json).
- Root docs: `README.md`, `PROJECT_CONTEXT.md`, `GEMINI.md` (this file).
- App shell: `src/app/layout.tsx`, `src/app/page.tsx` (public landing + layout present).
- DB connection: `src/lib/db/mongoose.ts` connects to `process.env.MONGODB_URI` and exports `clientPromise`.
- Models: `src/lib/db/models/*` — User, Salary, Income, Expense, Goal, Debt, Budget, LedgerEntry, MonthlySnapshot, RecurringRule, PendingDraft, AiInsightsCache.
- Auth: `src/lib/auth.ts` wires NextAuth with the MongoDB adapter and a credentials provider.
- AI layer: `src/lib/ai/groq.ts` and `src/lib/ai/prompts.ts` are implemented. AI API routes (`chat`, `insights`) are implemented with auth, validation, and rate-limiting.
- Ledger posting service: `src/lib/ledger/` — `postEntry.ts`, `updateSnapshot.ts`, `expenseActions.ts`, `incomeActions.ts`, `debtActions.ts`, `goalActions.ts`, `corrections.ts`.
- Domain API routes: salary, income, expenses, goals, debts, budgets, drafts, recurring-rules, dashboard, cron — all implemented with Zod validation.
- File storage: `src/lib/storage/gridfs.ts` — MongoDB GridFS for expense attachments.
- Tests: Vitest unit/integration tests for calculations, prompts, groq, ledger, recurring rules, and all API routes. Playwright e2e tests for the full finance workflow. axe-core accessibility scans for public pages.
- CI: `.github/workflows/ci.yml` runs `npm run lint` and `npm test`.

### 3) Immediate gaps & risks (must address before a public release)

- ~~AI integration is scaffolded but not implemented~~ → **Done.** AI provider, prompts, chat, and insights endpoints are implemented.
- ~~No tests detected~~ → **Done.** Vitest unit/integration + Playwright e2e + axe-core accessibility tests added.
- ~~Doc mismatch: `PROJECT_CONTEXT.md` references Next.js v14~~ → **Fixed.** Docs now reference Next.js 16.2.3 / React 19.2.4.
- Default user currency `'MAD'` in `User` model — confirmed as intended dev default.
- Ledger posting requires MongoDB transactions (replica set). Standalone MongoDB will throw an error. Document this in onboarding.

### 4) Goals for the major update / remake

1. ✅ Make AI features production-ready and secure (provider config, prompts, streaming endpoints, rate-limiting, server-side auth checks).
2. ✅ Harden authentication and session handling; safe password hashing, proper NextAuth options.
3. ✅ Implement missing domain API endpoints (salary, expenses, goals, debts, income, budgets) with Zod validation, error handling, and tests.
4. ✅ Add automated tests (unit for calculations, integration for API routes), CI pipeline, and lint checks.
5. ✅ Improve developer DX: dev scripts, `.env.example`, detailed README onboarding, and local environment guidance.

### 5) Priority Remake Checklist (concrete tasks)

Phase A — Safe scaffolding & fixes (1–2 days)
- [x] Confirm and document required environment variables in `.env.example` (`MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GROQ_API_KEY`, `CRON_SECRET`).
- [x] Add minimal CI (`.github/workflows/ci.yml`) to run `npm run lint` and `npm test`.
- [x] Add `vitest` and smoke tests for `src/lib/utils/calculations.ts` and DB connection (mocked).
- [x] Add `.env.example` file and update `README.md` run steps.

Phase B — Core backend features (2–4 days)
- [x] Implement `src/lib/ai/groq.ts` to initialize the Groq client using `process.env.GROQ_API_KEY` and export `groqModel` reference.
- [x] Implement `src/lib/ai/prompts.ts` with the system prompts and unit tests to validate prompt assembly.
- [x] Implement chat endpoint `src/app/api/ai/chat/route.ts` with server-side `auth()` checks, request validation, and a basic in-memory rate limit.
- [x] Implement `src/app/api/ai/insights/route.ts` to return JSON insights output (using `buildInsightsPrompt`) with validation and a basic rate limit.
- [x] Harden rate limiting on AI routes (simple in-memory limiter for MVP; replace with Redis for prod).

Phase C — Domain API & frontend integration (2–4 days)
- [x] Ensure CRUD routes for `salary`, `expenses`, `goals`, `debts`, `income`, `budgets` exist and are validated with Zod.
- [x] Add RecurringRule model + scheduled cron job that generates pending drafts (user confirms before ledger posting). Routes: `/api/recurring-rules`, `/api/drafts`, `/api/cron/recurring`.
- [x] Wire store hooks (`src/store/*`) to call the API routes and handle optimistic updates.
- [x] Connect dashboard components (`components/dashboard/*`) to real data (salary, expenses, goals) and add loading/error states.

Phase D — Quality & polish (2–3 days)
- [x] Add end-to-end smoke tests (Playwright) for registration, login, income, expense, dashboard, debt payment flows.
- [x] Add accessibility checks (axe-core via Playwright) for main public pages. Fix critical/serious violations.
- [x] Update docs: `README.md`, `PROJECT_CONTEXT.md`, and this `GEMINI.md` to reflect completed changes and the ledger-first architecture.

### 6) File-level map: where to work first

- AI provider and prompts: `src/lib/ai/groq.ts`, `src/lib/ai/prompts.ts` ✅
- AI endpoints: `src/app/api/ai/chat/route.ts`, `src/app/api/ai/insights/route.ts` ✅
- Auth: `src/lib/auth.ts` (wired, `auth.config.ts` verified)
- DB: `src/lib/db/mongoose.ts`, models under `src/lib/db/models/*` (indices and defaults verified)
- Ledger posting service: `src/lib/ledger/*` — the single entry point for all financial state changes
- Business logic: `src/lib/utils/calculations.ts` (tests cover this)
- Stores and frontend wiring: `src/store/*`, `src/components/dashboard/*` and `src/app/(dashboard)/*` ✅
- File storage: `src/lib/storage/gridfs.ts` (GridFS for expense attachments)
- E2e tests: `e2e/finance-workflow.spec.ts`, `e2e/accessibility.spec.ts`

### 7) Security & operational checklist

- Never log secrets or put API keys in source. Ensure `.env.local` is in `.gitignore`.
- Rotate Groq API keys and do minimal exposure: keep AI calls server-side only.
- Add rate-limiting and per-user quotas for AI endpoints. ✅ (in-memory limiter)
- Add input validation on all API routes (Zod) to avoid injections or unexpected payloads. ✅

### 8) Suggested short-term milestones (two-week sprint)

Sprint 1 (week 1):
- Implement Groq provider and prompts. [done]
- Implement AI chat endpoint with auth and basic streaming. [done]
- Add minimal tests for calculations and prompts. [done]

Sprint 2 (week 2):
- Implement insights endpoint and caching. [done]
- Wire dashboard components to real data (salary, fixed expenses). [done]
- Add CI pipeline and `.env.example`. [done]

### 9) Developer onboarding quick steps

1. Copy `.env.example` → `.env.local` and fill required variables.
2. Install dependencies: `npm install`.
3. Run dev: `npm run dev`.
4. Run tests: `npm test` (unit/integration) or `npm run test:e2e` (e2e, requires dev server).
5. Run lint: `npm run lint`.

> **Note:** Ledger posting requires a MongoDB replica set (transactions). A standalone MongoDB instance will throw an error. MongoDB Atlas free tier (M0) supports replica sets by default.

### 10) Architecture note

Flowlary uses a **ledger-first architecture** (see [`docs/adr/0001-ledger-first-architecture.md`](docs/adr/0001-ledger-first-architecture.md)). All financial state is computed at write time by the posting service (`src/lib/ledger/`) and stored in `MonthlySnapshot` documents. Read paths use these stored values — they do **not** recompute aggregates from the full ledger history.

> **Contributors:** Do not reintroduce live recomputation of aggregates from the full ledger on read paths. This was the approach used by the original Excel version and caused correctness bugs (e.g., a doubling bug from an unbounded `SUMIFS` reference). All financial state must be updated at write time by the posting service.

---

Updated: July 31, 2026