# Flowlary

Privacy-first, salary-driven personal finance app with an AI copilot. Track income, expenses, goals, and debts — all manual entry, no bank linking required.

## Architecture

Flowlary uses a **ledger-first architecture** — all financial state (balances, debt progress, goal savings, dashboard totals) is computed once at write time by a posting service and stored with the affected record. Read paths use these stored values and period snapshots; they do **not** recompute aggregates from the full transaction history at read time.

This avoids the class of bugs where live recomputation depends on every historical row and every formula range (the original Excel version had a doubling bug from an unbounded `SUMIFS` reference). Ledger entries are append-only; edits and deletions append correcting entries rather than mutating originals.

See [`docs/adr/0001-ledger-first-architecture.md`](docs/adr/0001-ledger-first-architecture.md) for the full architectural decision record.

> **Contributors:** Do not reintroduce live recomputation of aggregates from the full ledger on read paths. All financial state must be updated at write time by the posting service (`src/lib/ledger/`). Dashboard reads use `MonthlySnapshot` documents, not ad-hoc aggregation queries.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.3 (App Router) |
| UI | React 19.2.4, TypeScript 5.x, TailwindCSS 3.x, shadcn/ui |
| Database | MongoDB Atlas (free M0 tier) via Mongoose 9.x |
| Auth | NextAuth (Auth.js) v5 with MongoDB adapter + credentials provider |
| AI | Groq (`llama-3.3-70b-versatile`) via Vercel AI SDK |
| State | Zustand (client), MongoDB (source of truth) |
| Testing | Vitest (unit/integration), Playwright + axe-core (e2e/accessibility) |
| Deployment | Vercel (free hobby tier) |

## Developer Onboarding

1. Copy `.env.example` to `.env.local` and replace the placeholders with your local MongoDB, Auth.js, and Groq credentials.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).

## Testing

```bash
# Unit & integration tests (Vitest)
npm test

# End-to-end tests (Playwright) — requires dev server running on :3000
npm run test:e2e

# Lint
npm run lint
```

For e2e tests, first install the Playwright browser:
```bash
npx playwright install chromium
```

## Environment Variables

See [`.env.example`](.env.example) for all required and optional variables. Key ones:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | Session signing secret |
| `NEXTAUTH_URL` | Base URL for callbacks |
| `GROQ_API_KEY` | Server-side Groq API key |
| `CRON_SECRET` | Authorizes the recurring-rules cron endpoint |

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login & register pages
│   ├── (dashboard)/         # Dashboard, expenses, goals, debts, history, settings
│   ├── api/                 # API routes (auth, salary, expenses, goals, debts, income, budgets, drafts, recurring-rules, ai, dashboard, cron)
│   └── layout.tsx           # Root layout
├── components/              # UI components (dashboard, expenses, debts, goals, layout, ui)
├── lib/
│   ├── ai/                  # Groq provider, prompts, rate-limiting
│   ├── db/                  # Mongoose connection, models, types
│   ├── ledger/              # Posting service (append-only ledger, snapshots, debt/goal actions)
│   ├── recurring/           # Recurring rule processing
│   ├── storage/             # GridFS file storage (expense attachments)
│   ├── utils/               # Calculations, currency, optimistic updates
│   └── validations/         # Zod schemas
└── store/                   # Zustand stores
```

## Key Architectural Decisions

- **Ledger-first:** Financial state is computed at write time, not read time. See [ADR 0001](docs/adr/0001-ledger-first-architecture.md).
- **Append-only ledger:** Edits and deletions append correcting entries; original records are never mutated.
- **Monthly snapshots:** Dashboard reads `MonthlySnapshot` documents for the requested period instead of recalculating from all transactions.
- **Privacy-first:** No bank account linking. All data is manual entry.
- **Zero cost:** Runs entirely on free tiers (Vercel, MongoDB Atlas M0, Groq free tier).

## Documentation

- [Project Context](PROJECT_CONTEXT.md) — detailed architecture, models, and conventions
- [GEMINI.md](GEMINI.md) — project snapshot and remake checklist
- [ADR 0001: Ledger-First Architecture](docs/adr/0001-ledger-first-architecture.md)
- [Accessibility Audit](docs/accessibility-audit.md)