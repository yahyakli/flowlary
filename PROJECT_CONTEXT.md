# Flowlary — Project Context File
> Feed this file to any AI assistant (Cursor, GitHub Copilot, Google Gemini, etc.) at the start of every session to maintain full project context.

---

## What This App Is

**Flowlary** is a fullstack salary management web application. The core idea: a user enters their monthly (or biweekly) salary, adds all their fixed responsibilities (rent, bills, subscriptions, loans), logs their variable daily spending, sets savings goals, and gets a smart AI-powered dashboard that tells them exactly where their money is, where it's going, and what they should do next.

**The key differentiator from competitors (Mint, YNAB, Copilot, Monarch Money):**
- No bank account linking required — fully manual entry, privacy-first
- Built around the salary cycle, not generic transactions
- Proactive AI copilot that speaks BEFORE the user overspends, not after
- Groq-powered AI that gives personalized, context-aware financial advice
- Zero cost to run — all free tiers, no credit card required anywhere
- Works for any currency / any country (MENA, Africa, Europe, etc.)

---

## Architecture: Ledger-First (Source of Truth)

Flowlary uses a **ledger-first architecture** as the current source of truth for all financial state. All financial state (running balance, debt balances, goal savings, monthly dashboard totals) is computed **once at write time** by a posting service and stored with the affected record. Read paths use these stored values and period snapshots; they do **not** recompute aggregates from the full transaction history at read time.

**Key principles:**
- **Write-time computation:** The posting service (`src/lib/ledger/postEntry.ts`) calculates balances atomically when recording a ledger entry, within a MongoDB transaction.
- **Append-only ledger:** Ledger entries are never mutated or deleted. Edits and deletions append correcting entries that reverse the original effect.
- **Monthly snapshots:** `MonthlySnapshot` documents store pre-computed totals (income, expenses, net balance, expense-by-category) for each month. Dashboard reads use these snapshots, not live aggregation.
- **No live recomputation:** Read paths must not recompute aggregates from the full ledger history. This avoids the class of bugs where results depend on every historical row and every formula range.

> **Contributors:** Do not reintroduce live recomputation of aggregates from the full ledger on read paths. All financial state must be updated at write time by the posting service. See [`docs/adr/0001-ledger-first-architecture.md`](docs/adr/0001-ledger-first-architecture.md) for the full decision record.

---

## Tech Stack

### Frontend
| Package | Purpose |
|---|---|
| `next` 16.2.3 (App Router) | Framework — SSR, API routes, routing |
| `react` 19.2.4 | UI library |
| `typescript` 5.x | Full type safety end-to-end |
| `tailwindcss` 3.x | Utility-first CSS |
| `shadcn/ui` | Component library (Radix-based, fully customizable) |
| `lucide-react` | Icon library (1000+ SVG icons) |
| `sonner` | Toast notifications |
| `recharts` | Charts (built on D3 + React) |

### Data & Forms
| Package | Purpose |
|---|---|
| `react-hook-form` | Form state management |
| `zod` | Schema validation + TypeScript type inference |
| `axios` | HTTP client with interceptors |
| `zustand` | Lightweight global state management |

### Backend & Database
| Package | Purpose |
|---|---|
| MongoDB Atlas (free M0 tier) | Database — 512MB free, no credit card |
| `mongoose` 9.x | ODM — typed schemas, models, queries |
| `mongodb` 6.x | Native driver (GridFS for file attachments) |
| `next-auth` v5 | Authentication with MongoDB adapter |
| `bcryptjs` | Password hashing |

### AI Layer
| Package | Purpose |
|---|---|
| `ai` (Vercel AI SDK) | Unified streaming interface for AI providers |
| `@ai-sdk/groq` | Groq provider adapter |
| Groq API — `llama-3.3-70b-versatile` | Primary AI — free tier, no credit card required |

### Testing
| Package | Purpose |
|---|---|
| `vitest` | Unit & integration tests |
| `@playwright/test` | End-to-end tests |
| `@axe-core/playwright` | Automated accessibility scans |

### Deployment (Total cost: $0/month)
| Service | Tier |
|---|---|
| Vercel | Free hobby tier — hosts Next.js |
| MongoDB Atlas | Free M0 tier — database |
| Groq Console | Free tier — AI inference (30 RPM, ~500k tokens/day) |

---

## Environment Variables

See `.env.example` for the full list. Key variables:

```env
# .env.local

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/flowlary

# NextAuth
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# Groq AI
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Cron (recurring rules endpoint authorization)
CRON_SECRET=replace_with_a_random_string
```

---

## Project Folder Structure

```
flowlary/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            ← sidebar + topbar shell
│   │   │   ├── dashboard/page.tsx    ← main dashboard overview (reads MonthlySnapshot)
│   │   │   ├── expenses/page.tsx     ← fixed & variable expenses
│   │   │   ├── goals/page.tsx        ← savings goals tracker
│   │   │   ├── debts/page.tsx        ← debt tracker
│   │   │   ├── history/page.tsx      ← monthly history & trends
│   │   │   └── settings/page.tsx     ← profile, currency, preferences
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── auth/register/route.ts
│   │   │   ├── salary/route.ts       ← GET, POST, PUT salary
│   │   │   ├── income/route.ts       ← CRUD income
│   │   │   ├── expenses/route.ts     ← CRUD expenses (+ attachment upload)
│   │   │   ├── goals/route.ts        ← CRUD goals
│   │   │   ├── debts/route.ts        ← CRUD debts (+ pay endpoint)
│   │   │   ├── budgets/route.ts      ← CRUD budgets
│   │   │   ├── drafts/route.ts       ← pending draft confirmation
│   │   │   ├── recurring-rules/route.ts ← recurring rule CRUD
│   │   │   ├── cron/recurring/route.ts  ← scheduled recurring processing
│   │   │   ├── dashboard/route.ts    ← reads MonthlySnapshot (no live aggregation)
│   │   │   ├── dashboard/trend/route.ts
│   │   │   ├── files/[id]/route.ts   ← serves GridFS attachments
│   │   │   └── ai/
│   │   │       ├── chat/route.ts     ← streaming AI chat endpoint
│   │   │       └── insights/route.ts ← proactive AI analysis endpoint
│   │   ├── globals.css
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                       ← shadcn auto-generated components
│   │   ├── dashboard/                ← dashboard charts, dialogs, summary
│   │   ├── expenses/                 ← expense dialogs, transaction lists
│   │   ├── debts/                    ← debt dialogs
│   │   ├── goals/                    ← goal dialogs
│   │   └── layout/                   ← Sidebar, Navbar, Footer, ScrollToTop
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── mongoose.ts           ← MongoDB connection singleton
│   │   │   ├── models/
│   │   │   │   ├── User.ts
│   │   │   │   ├── Salary.ts
│   │   │   │   ├── Income.ts
│   │   │   │   ├── Expense.ts
│   │   │   │   ├── Goal.ts
│   │   │   │   ├── Debt.ts
│   │   │   │   ├── Budget.ts
│   │   │   │   ├── LedgerEntry.ts    ← append-only ledger
│   │   │   │   ├── MonthlySnapshot.ts ← pre-computed monthly totals
│   │   │   │   ├── RecurringRule.ts
│   │   │   │   ├── PendingDraft.ts
│   │   │   │   └── AiInsightsCache.ts
│   │   │   └── types/                ← TypeScript interfaces for all models
│   │   ├── ledger/                   ← POSTING SERVICE (write-time computation)
│   │   │   ├── postEntry.ts          ← appends ledger entry + updates snapshot (transactional)
│   │   │   ├── updateSnapshot.ts     ← updates MonthlySnapshot
│   │   │   ├── expenseActions.ts     ← creates expense + posts ledger entry
│   │   │   ├── incomeActions.ts      ← creates income + posts ledger entry
│   │   │   ├── debtActions.ts        ← records debt payment + posts ledger entry
│   │   │   ├── goalActions.ts        ← records goal contribution + posts ledger entry
│   │   │   └── corrections.ts        ← append-only correcting entries for edits/deletions
│   │   ├── recurring/               ← recurring rule processing
│   │   ├── storage/                  ← GridFS file storage (expense attachments)
│   │   ├── ai/
│   │   │   ├── groq.ts               ← Groq provider config
│   │   │   ├── prompts.ts            ← all system prompts
│   │   │   └── rate-limit.ts         ← in-memory rate limiter
│   │   ├── validations/              ← Zod schemas for all entities
│   │   └── utils/
│   │       ├── currency.ts           ← format currencies
│   │       ├── calculations.ts       ← health score, projections
│   │       └── optimistic.ts         ← optimistic update helpers
│   │
│   └── store/                        ← Zustand stores (UI state + cached data)
│       ├── useSalaryStore.ts
│       ├── useExpenseStore.ts
│       ├── useIncomeStore.ts
│       ├── useGoalStore.ts
│       ├── useDebtStore.ts
│       ├── useBudgetStore.ts
│       └── useAIStore.ts
│
├── e2e/                              ← Playwright e2e + axe-core accessibility tests
├── docs/
│   ├── adr/
│   │   └── 0001-ledger-first-architecture.md  ← architectural decision record
│   └── accessibility-audit.md
└── playwright.config.ts
```

---

## Database Models (Mongoose + TypeScript)

> **Note:** The models below are summaries. See `src/lib/db/types/` for the authoritative TypeScript interfaces and `src/lib/db/models/` for the Mongoose schemas.

### User
```typescript
interface IUser {
  _id: ObjectId
  name: string
  email: string                        // unique, indexed
  passwordHash: string
  currency: string                     // default: 'MAD'
  locale: string                       // default: 'en-US'
  createdAt: Date
  updatedAt: Date
}
```

### Salary
```typescript
interface ISalary {
  _id: ObjectId
  userId: ObjectId                     // ref: User
  amount: number                       // net take-home amount
  frequency: 'monthly' | 'biweekly' | 'weekly'
  effectiveDate: Date
  createdAt: Date
}
```

### Expense
```typescript
interface IExpense {
  _id: ObjectId
  userId: string
  date: Date
  category: ExpenseCategory
  description: string
  amount: number
  notes?: string
  title?: string
  type?: 'fixed' | 'variable'
  isRecurring?: boolean
  dueDay?: number                      // day of month (1-31), for fixed expenses
  month?: number                       // 1-12
  year?: number
  tags?: string[]
  note?: string
  attachmentUrl?: string               // GridFS attachment URL (optional)
  createdAt: Date
  updatedAt: Date
}
```

### Goal
```typescript
interface IGoal {
  _id: ObjectId
  userId: string
  name: string
  title: string
  targetAmount: number
  currentSaved: number                 // updated at write time by posting service
  savedAmount?: number
  deadline: Date
  monthlyContribution?: number
  icon?: string
  color?: string
  isCompleted?: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Debt
```typescript
interface IDebt {
  _id: ObjectId
  userId: string
  title: string
  totalAmount: number
  remainingAmount: number
  currentBalance: number               // updated at write time by posting service
  monthlyPayment: number
  interestRate: number
  dueDay: number
  lender?: string
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}
```

### LedgerEntry (append-only)
```typescript
interface ILedgerEntry {
  _id: ObjectId
  userId: ObjectId
  type: 'income' | 'expense' | 'debt_payment' | 'goal_contribution' | 'correction'
  amountIn?: number
  amountOut?: number
  resultingBalance: number             // running balance after this entry
  date: Date
  category?: string
  sourceRefId?: ObjectId               // ref to the source record (expense, debt, etc.)
  note?: string
  createdAt: Date
}
```

### MonthlySnapshot (pre-computed by posting service)
```typescript
interface IMonthlySnapshot {
  _id: ObjectId
  userId: string
  month: string                        // 'YYYY-MM'
  totalIncome: number
  totalExpenses: number
  netBalance: number
  expenseByCategory: Record<string, number>
  savingsRate: number
  updatedAt: Date
}
```

---

## AI Integration (Groq via Vercel AI SDK)

### How to get a Groq API key (free, no credit card)
1. Go to `console.groq.com`
2. Sign up with email or GitHub
3. Go to API Keys → Create key
4. Copy to `.env.local` as `GROQ_API_KEY`

### Provider Setup (`src/lib/ai/groq.ts`)
```typescript
import { createGroq } from '@ai-sdk/groq'

export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
})

export const groqModel = groq('llama-3.3-70b-versatile')
```

### Streaming Chat API Route (`src/app/api/ai/chat/route.ts`)
```typescript
import { streamText } from 'ai'
import { groqModel } from '@/lib/ai/groq'
import { buildChatSystemPrompt } from '@/lib/ai/prompts'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages, userContext } = await req.json()

  const result = await streamText({
    model: groqModel,
    system: buildChatSystemPrompt(userContext),
    messages,
    maxTokens: 1000,
  })

  return result.toDataStreamResponse()
}
```

### AI Features in the App
| Feature | Trigger | Output |
|---|---|---|
| Copilot Chat | User opens chat panel | Streaming conversation |
| Proactive Insights | Dashboard page load (cached 24h) | 1-3 insight cards + health score |
| Month-end Review | Last day of month | Summary paragraph |
| Smart Alerts | Expense added that exceeds budget | Toast notification with tip |

---

## Key Business Logic

### Posting Service (`src/lib/ledger/`)

The posting service is the **single entry point** for all financial state changes. It appends a `LedgerEntry` and updates the affected record + `MonthlySnapshot` within a MongoDB transaction.

```typescript
// src/lib/ledger/postEntry.ts — appends a ledger entry and updates the monthly snapshot
export async function postLedgerEntry(
  userId: ObjectId,
  entryInput: LedgerEntryInput,
  options?: { session?: ClientSession }
): Promise<ILedgerEntry> {
  // 1. Acquire a per-user write lock (User.updateOne) to serialize concurrent postings
  // 2. Read the previous ledger entry to get the running balance
  // 3. Create the new entry with resultingBalance = prevBalance + amountIn - amountOut
  // 4. Update the MonthlySnapshot for the entry's month
  // All within a single transaction (requires MongoDB replica set)
}
```

```typescript
// src/lib/ledger/expenseActions.ts — creates an expense and posts a ledger entry
export async function createExpenseEntry(userId: ObjectId, data: ExpenseSchema): Promise<IExpense> {
  // 1. Create the Expense document
  // 2. Post a ledger entry (type: 'expense', amountOut: data.amount)
  // 3. If the ledger posting fails, delete the Expense to maintain consistency
}
```

> **Important:** Financial state (balances, debt progress, goal savings, dashboard totals) is computed at write time by the posting service and stored in `MonthlySnapshot` documents. Read paths (e.g., `/api/dashboard`) read these stored values — they do **not** recompute from the full ledger history.

### Utility Calculations (`src/lib/utils/calculations.ts`)

```typescript
// Health score 0-100
export const calculateHealthScore = (data: {
  savingsRate: number
  debtToIncomeRatio: number
  budgetAdherence: number
  hasEmergencyFund: boolean
}): number => {
  let score = 0
  score += Math.min(data.savingsRate * 2, 30)
  score += Math.max(30 - data.debtToIncomeRatio, 0)
  score += Math.round(data.budgetAdherence * 0.3)
  score += data.hasEmergencyFund ? 10 : 0
  return Math.min(Math.round(score), 100)
}
```

### Currency Formatting (`src/lib/utils/currency.ts`)

```typescript
export function formatCurrency(value: number | string | null | undefined): string {
  // Uses Intl.NumberFormat with 'en-US' locale and 'USD' currency
  // Returns '—' for non-finite values
}
```

---

## Pages Overview

### `/` — Landing Page
- Public marketing page with feature highlights
- Redirects authenticated users to `/dashboard`

### `/dashboard` — Dashboard Overview
- Reads `MonthlySnapshot` for the selected month (no live aggregation)
- Total Income, Total Expenses, Net Balance, Savings Rate stat cards
- Category breakdown chart and 6-month trend chart
- Add Income dialog for quick income entry

### `/expenses` — Expense Manager
- Fixed & variable expense stats for the current month
- Transaction list with search
- Add / Edit / Delete via RHF + Zod form in a dialog
- Category breakdown donut chart

### `/goals` — Savings Goals
- Grid of goal cards with progress bars and projected completion date
- Add contribution, edit goal, mark complete

### `/debts` — Debt Tracker
- List: remaining balance, monthly payment, due day, payoff timeline
- Visual payoff progress bar
- One-click "Pay" button (pays min(balance, monthlyPayment))

### `/history` — Monthly History
- Month/year selector
- Past month summary cards
- Trend chart comparing months side by side

### `/settings` — User Settings
- Name, email, password update
- Currency and locale selector
- Salary update
- Account deletion

---

## Auth Flow (NextAuth v5 with Credentials)

```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async ({ email, password }) => {
        // find user in DB, compare bcrypt hash, return user or null
      }
    })
  ],
  session: { strategy: 'jwt' },
})
```

---

## Coding Conventions

- All components use TypeScript with explicit prop interfaces (`interface Props { ... }`)
- API routes validate request body with Zod before touching the DB
- Mongoose read queries use `.lean()` for better performance
- Error responses shape: `{ error: string, code?: string }`
- Success responses shape: `{ data: T, message?: string }`
- Dates stored as UTC in MongoDB, displayed in user locale on client
- Currency always formatted via `Intl.NumberFormat`, never string concatenation
- `process.env` values accessed only server-side (API routes, server components)
- Zustand stores hold UI state and cached data; MongoDB is always source of truth
- **Financial state is computed at write time by the posting service (`src/lib/ledger/`), not at read time.** Dashboard reads use `MonthlySnapshot` documents. Never reintroduce live recomputation from the full ledger history.
- shadcn components added via `npx shadcn@latest add <component-name>`

---

## Competitor Landscape

| Competitor | Main Weakness vs Flowlary |
|---|---|
| YNAB | $14.99/month, complex learning curve, US-centric |
| Mint (discontinued) | Required bank linking, US only |
| Copilot | Apple ecosystem only, requires bank linking |
| Monarch Money | Paid subscription, requires bank linking |
| PocketGuard | Ad-supported, requires bank linking |

**Flowlary edge:** fully manual (privacy-first), salary-cycle focused, proactive AI advice, completely free, works in any country with any currency.

---

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Unit & integration tests
npm test

# End-to-end tests (requires dev server running on :3000)
npm run test:e2e

# Lint
npm run lint

# Build for production
npm run build
```

---

*Last updated: July 2026*
*Stack: Next.js 16.2.3 · React 19.2.4 · TypeScript 5 · Tailwind CSS 3 · shadcn/ui · Mongoose 9 · NextAuth v5 · Groq llama-3.3-70b · Vercel AI SDK*