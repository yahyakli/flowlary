# GEMINI: Flowlary — Project Snapshot and Remake Plan

This document is a single-source reference for the current repository state, gaps discovered during review, and a prioritized, actionable plan to perform a major update / partial remake of Flowlary.

Keep this file as the onboarding + plan doc for any large refactor or rewrite. Use the steps below as checkboxes during work and update progress there.

--

### 1) High-level summary

- Purpose: privacy-first salary-driven personal finance app with an AI copilot.
- Stack (actual from repository): Next.js 16.2.3, React 19.2.4, TypeScript 5.x, TailwindCSS 3.x, Mongoose + MongoDB Atlas, NextAuth (Auth.js) v5, Groq via Vercel AI SDK.

### 2) Quick inventory (what I inspected)

- `package.json`: project dependencies and exact versions (Next 16.2.3, React 19.2.4). See [package.json](package.json).
- Root docs: `README.md`, `PROJECT_CONTEXT.md`, `GEMINI.md` (this file was expanded).
- App shell: `src/app/layout.tsx`, `src/app/page.tsx` (public landing + layout present). See [src/app/layout.tsx](src/app/layout.tsx) and [src/app/page.tsx](src/app/page.tsx).
- DB connection: `src/lib/db/mongoose.ts` connects to `process.env.MONGODB_URI` and exports `clientPromise`.
- Models: `src/lib/db/models/User.ts` exists and exposes `User` model (default currency set to 'MAD').
- Auth: `src/lib/auth.ts` wires NextAuth with the MongoDB adapter and a credentials provider.
- AI layer files: `src/lib/ai/prompts.ts` and `src/lib/ai/groq.ts` are present but empty — major missing piece.
- AI API routes: `src/app/api/ai/chat/route.ts` and `src/app/api/ai/insights/route.ts` exist but return `501 Not Implemented`.

### 3) Immediate gaps & risks (must address before a public release)

- AI integration is scaffolded but not implemented: `src/lib/ai/*` are empty and API routes return 501s. The system prompts referenced in code (PROJECT_CONTEXT) are not present in the codebase.
- No tests detected (unit/integration). No CI configured in repo root.
- Some doc mismatch: `PROJECT_CONTEXT.md` references Next.js v14 in comments; `package.json` uses v16 — keep `package.json` authoritative.
- Default user currency `'MAD'` in `User` model may be unexpected (likely a dev default) — confirm intended default.
- No streaming AI handlers implemented; the public API behavior is unimplemented and must be designed carefully (auth, rate-limits, caching).

### 4) Goals for the major update / remake

1. Make AI features production-ready and secure (implement provider config, prompts, streaming endpoints, rate-limiting, and server-side auth checks).
2. Harden authentication and session handling; ensure safe password hashing, proper NextAuth options, and session lifetime policies.
3. Implement missing domain API endpoints (salary, expenses, goals, debts) with robust validation (Zod), error handling, and tests.
4. Add automated tests (unit for calculations, integration for API routes), simple CI pipeline, and lint/format checks.
5. Improve developer DX: dev scripts, seed data, detailed README onboarding, and local environment guidance.

### 5) Priority Remake Checklist (concrete tasks)

Phase A — Safe scaffolding & fixes (1–2 days)
- [ ] Confirm and document required environment variables in `.env.example` (`MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GROQ_API_KEY`).
- [x] Add minimal CI (`.github/workflows/ci.yml`) to run `npm run lint` and `npm test`.
- [x] Add `jest`/`vitest` and a few smoke tests for `src/lib/utils/calculations.ts` and DB connection (mocked).
- [x] Add `.env.example` file and update `README.md` run steps.

Phase B — Core backend features (2–4 days)
- [x] Implement `src/lib/ai/groq.ts` to initialize the Groq client using `process.env.GROQ_API_KEY` and export `groqModel` reference.
- [x] Implement `src/lib/ai/prompts.ts` with the system prompts (use the templates from `PROJECT_CONTEXT.md`) and unit tests to validate prompt assembly.
- [x] Implement chat endpoint `src/app/api/ai/chat/route.ts` with server-side `auth()` checks, request validation, and a basic in-memory rate limit.
- [x] Implement `src/app/api/ai/insights/route.ts` to return JSON insights output (using `buildInsightsPrompt`) with validation and a basic rate limit.
- [x] Harden rate limiting on AI routes (simple in-memory limiter for MVP; replace with Redis for prod).

Phase C — Domain API & frontend integration (2–4 days)
- [ ] Ensure CRUD routes for `salary`, `expenses`, `goals`, `debts` exist and are validated with Zod (the repo shows `app/api/*` placeholders — implement as needed).
- [x] Add RecurringRule model + scheduled cron job that generates pending drafts (user confirms before ledger posting). Routes: `/api/recurring-rules`, `/api/drafts`, `/api/cron/recurring`.
- [ ] Wire store hooks (`src/store/*`) to call the API routes and handle optimistic updates.
- [ ] Connect dashboard components (`components/dashboard/*`) to real data (salary, expenses, goals) and add loading/error states.

Phase D — Quality & polish (2–3 days)
- [ ] Add end-to-end smoke tests (Cypress or Playwright) for registration, login, create salary, create expense flows.
- [ ] Add accessibility and i18n checks (currency/locale formatting is already part of the plan).
- [ ] Update docs: `README.md`, `PROJECT_CONTEXT.md`, and this `GEMINI.md` to reflect completed changes.

### 6) File-level map: where to work first

- AI provider and prompts: `src/lib/ai/groq.ts`, `src/lib/ai/prompts.ts` (currently empty)
- AI endpoints: `src/app/api/ai/chat/route.ts`, `src/app/api/ai/insights/route.ts` (501s)
- Auth: `src/lib/auth.ts` (already wired, verify `auth.config.ts` and `middleware.ts`)
- DB: `src/lib/db/mongoose.ts`, models under `src/lib/db/models/*` (verify indices and defaults)
- Business logic: `src/lib/utils/calculations.ts` (tests should cover this)
- Stores and frontend wiring: `src/store/*`, `src/components/dashboard/*` and `src/app/(dashboard)/*`

### 7) Security & operational checklist

- Never log secrets or put API keys in source. Ensure `.env.local` is in `.gitignore`.
- Rotate Groq API keys and do minimal exposure: keep AI calls server-side only.
- Add rate-limiting and per-user quotas for AI endpoints.
- Add input validation on all API routes (Zod) to avoid injections or unexpected payloads.

### 8) Suggested short-term milestones (two-week sprint)

Sprint 1 (week 1):
- Implement Groq provider and prompts. [done]
- Implement AI chat endpoint with auth and basic streaming. [done]
- Add minimal tests for calculations and prompts. [done]

Sprint 2 (week 2):
- Implement insights endpoint and caching.
- Wire dashboard components to real data (salary, fixed expenses).
- Add CI pipeline and `.env.example`.

### 9) Developer onboarding quick steps

1. Copy `.env.example` → `.env.local` and fill required variables.
2. Install dependencies: `npm install`.
3. Run dev: `npm run dev`.
4. Run tests: `npm test` (after tests are added).

### 10) Action now (what I will do next if you approve)

- Draft and add an `.env.example` file describing required environment variables.
- Implement `src/lib/ai/prompts.ts` and `src/lib/ai/groq.ts` with a safe default that returns an error if `GROQ_API_KEY` is missing.
- Implement a first-pass `chat/route.ts` that proxies to Groq streaming with server-side auth and a basic in-memory rate limiter.

--

Keep this `GEMINI.md` updated as you make progress. After the initial AI wiring is implemented I will produce a smaller checklist PR that implements one endpoint end-to-end (create salary → recalc health score → AI insight run).

---
Updated: automatic repo review (Jul 28, 2026)

