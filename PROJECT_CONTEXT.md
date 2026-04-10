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

## Tech Stack

### Frontend
| Package | Purpose |
|---|---|
| `next` 14 (App Router) | Framework — SSR, API routes, routing |
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
| `mongoose` | ODM — typed schemas, models, queries |
| `next-auth` v5 | Authentication with MongoDB adapter |
| `bcryptjs` | Password hashing |

### AI Layer
| Package | Purpose |
|---|---|
| `ai` (Vercel AI SDK) | Unified streaming interface for AI providers |
| `@ai-sdk/groq` | Groq provider adapter |
| Groq API — `llama-3.3-70b-versatile` | Primary AI — free tier, no credit card required |

### Deployment (Total cost: $0/month)
| Service | Tier |
|---|---|
| Vercel | Free hobby tier — hosts Next.js |
| MongoDB Atlas | Free M0 tier — database |
| Groq Console | Free tier — AI inference (30 RPM, ~500k tokens/day) |

---

## Environment Variables

```env
# .env.local

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/flowlary

# NextAuth
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# Groq AI
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Project Folder Structure

```
flowlary/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            ← sidebar + topbar shell
│   │   ├── page.tsx              ← main dashboard overview
│   │   ├── expenses/page.tsx     ← fixed & variable expenses
│   │   ├── goals/page.tsx        ← savings goals tracker
│   │   ├── debts/page.tsx        ← debt tracker
│   │   ├── history/page.tsx      ← monthly history & trends
│   │   └── settings/page.tsx     ← profile, currency, preferences
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── salary/route.ts       ← GET, POST, PUT salary
│   │   ├── expenses/route.ts     ← CRUD expenses
│   │   ├── goals/route.ts        ← CRUD goals
│   │   ├── debts/route.ts        ← CRUD debts
│   │   └── ai/
│   │       ├── chat/route.ts     ← streaming AI chat endpoint
│   │       └── insights/route.ts ← proactive AI analysis endpoint
│   ├── globals.css
│   └── layout.tsx
│
├── components/
│   ├── ui/                       ← shadcn auto-generated components
│   ├── dashboard/
│   │   ├── SalaryOverview.tsx    ← top card: salary, committed, free
│   │   ├── BudgetDonut.tsx       ← donut chart: budget breakdown
│   │   ├── SpendingChart.tsx     ← bar chart: spending by category
│   │   ├── GoalsProgress.tsx     ← progress bars for savings goals
│   │   ├── HealthScore.tsx       ← AI-calculated financial health 0-100
│   │   └── AIInsightCard.tsx     ← proactive AI tip of the day
│   ├── ai/
│   │   └── CopilotChat.tsx       ← floating chat panel (Groq streaming)
│   ├── expenses/
│   │   ├── ExpenseForm.tsx       ← RHF + Zod form in shadcn Sheet
│   │   └── ExpenseList.tsx
│   ├── goals/
│   │   ├── GoalCard.tsx
│   │   └── GoalForm.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       └── Topbar.tsx
│
├── lib/
│   ├── db/
│   │   ├── mongoose.ts           ← MongoDB connection singleton
│   │   └── models/
│   │       ├── User.ts
│   │       ├── Salary.ts
│   │       ├── Expense.ts
│   │       ├── Goal.ts
│   │       └── Debt.ts
│   ├── ai/
│   │   ├── groq.ts               ← Groq provider config
│   │   └── prompts.ts            ← all system prompts
│   ├── validations/
│   │   ├── salary.schema.ts      ← Zod schemas
│   │   ├── expense.schema.ts
│   │   └── goal.schema.ts
│   └── utils/
│       ├── currency.ts           ← format, convert currencies
│       └── calculations.ts       ← health score, projections
│
├── store/
│   ├── useSalaryStore.ts         ← Zustand stores
│   ├── useExpenseStore.ts
│   └── useAIStore.ts
│
└── middleware.ts                 ← NextAuth route protection
```

---

## Database Models (Mongoose + TypeScript)

### User
```typescript
interface IUser {
  _id: ObjectId
  name: string
  email: string                        // unique, indexed
  passwordHash: string
  currency: string                     // default: 'USD'
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
  userId: ObjectId                     // ref: User
  title: string
  amount: number
  category: ExpenseCategory
  type: 'fixed' | 'variable'
  isRecurring: boolean                 // fixed expenses are always recurring
  dueDay?: number                      // day of month (1-31), for fixed expenses
  month: number                        // 1-12
  year: number
  tags: string[]
  note?: string
  createdAt: Date
}

type ExpenseCategory =
  | 'housing'        // rent, mortgage
  | 'utilities'      // electricity, water, internet, phone
  | 'subscriptions'  // Netflix, gym, software
  | 'transport'      // fuel, public transport, ride-share
  | 'food'           // groceries, restaurants
  | 'healthcare'     // doctor, pharmacy, insurance
  | 'education'      // courses, books, tuition
  | 'entertainment'  // outings, hobbies
  | 'clothing'
  | 'personal'       // haircut, cosmetics
  | 'family'         // kids, parents support
  | 'other'
```

### Goal
```typescript
interface IGoal {
  _id: ObjectId
  userId: ObjectId                     // ref: User
  title: string
  targetAmount: number
  savedAmount: number                  // updated as user logs contributions
  deadline?: Date
  monthlyContribution: number          // how much to set aside per month
  icon: string                         // lucide icon name e.g. 'plane', 'car', 'home'
  color: string                        // tailwind color e.g. 'blue', 'green'
  isCompleted: boolean
  createdAt: Date
}
```

### Debt
```typescript
interface IDebt {
  _id: ObjectId
  userId: ObjectId                     // ref: User
  title: string
  totalAmount: number
  remainingAmount: number
  monthlyPayment: number
  interestRate?: number                // annual percentage (optional)
  dueDay: number                       // day of month payment is due
  lender?: string
  isCompleted: boolean
  createdAt: Date
}
```

---

## AI Integration (Groq via Vercel AI SDK)

### How to get a Groq API key (free, no credit card)
1. Go to `console.groq.com`
2. Sign up with email or GitHub
3. Go to API Keys → Create key
4. Copy to `.env.local` as `GROQ_API_KEY`

### Provider Setup (`lib/ai/groq.ts`)
```typescript
import { createGroq } from '@ai-sdk/groq'

export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
})

export const groqModel = groq('llama-3.3-70b-versatile')
```

### Streaming Chat API Route (`app/api/ai/chat/route.ts`)
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

### System Prompts (`lib/ai/prompts.ts`)
```typescript
interface UserContext {
  currency: string
  salary: number
  totalFixed: number
  fixedPercent: number
  totalVariable: number
  remaining: number
  healthScore: number
  goals: Array<{ title: string; progress: number }>
  debts: Array<{ title: string; monthlyPayment: number }>
}

export function buildChatSystemPrompt(ctx: UserContext): string {
  return `
You are Flowlary Copilot, a personal financial advisor AI embedded in a salary management app.

USER FINANCIAL CONTEXT:
- Monthly net salary: ${ctx.currency} ${ctx.salary}
- Fixed monthly costs: ${ctx.currency} ${ctx.totalFixed} (${ctx.fixedPercent}% of salary)
- Variable spending this month: ${ctx.currency} ${ctx.totalVariable}
- Remaining free budget: ${ctx.currency} ${ctx.remaining}
- Active savings goals: ${ctx.goals.map(g => `${g.title} (${g.progress}% complete)`).join(', ')}
- Active debts: ${ctx.debts.map(d => `${d.title} — ${ctx.currency} ${d.monthlyPayment}/mo`).join(', ')}
- Financial health score: ${ctx.healthScore}/100

YOUR ROLE:
- Answer questions about whether the user can afford things
- Suggest how to optimize their budget
- Give concrete, actionable advice (not generic tips)
- Be encouraging but realistic
- Keep responses concise (2-4 sentences for simple questions, max 6 for complex)
- Always use the user's currency (${ctx.currency})
- Never recommend specific financial products or investments
  `.trim()
}

export function buildInsightsPrompt(ctx: UserContext): string {
  return `
Analyze this user's financial data and return a JSON object with insights.

DATA:
${JSON.stringify(ctx, null, 2)}

Return ONLY valid JSON, no markdown, no explanation:
{
  "healthScore": number (0-100),
  "headline": "one sharp sentence about their financial situation",
  "insights": [
    { "type": "warning" | "tip" | "achievement", "message": "specific insight" }
  ],
  "suggestion": "one specific actionable thing they can do this month"
}

Rules: max 3 insights, be specific not generic, use their actual numbers.
  `.trim()
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

## Key Business Logic (`lib/utils/calculations.ts`)

```typescript
// Spendable budget after all fixed commitments
export const getFreeBudget = (
  salary: number,
  fixedExpenses: IExpense[],
  debts: IDebt[]
): number =>
  salary
  - fixedExpenses.reduce((sum, e) => sum + e.amount, 0)
  - debts.reduce((sum, d) => sum + d.monthlyPayment, 0)

// Health score 0-100
export const calculateHealthScore = (data: {
  savingsRate: number        // % of salary going to goals (0-100)
  debtToIncomeRatio: number  // (total monthly debt payments / salary) * 100
  budgetAdherence: number    // % of months within budget (0-100)
  hasEmergencyFund: boolean
}): number => {
  let score = 0
  score += Math.min(data.savingsRate * 2, 30)           // max 30 pts — saving is key
  score += Math.max(30 - data.debtToIncomeRatio, 0)     // max 30 pts — low debt = good
  score += Math.round(data.budgetAdherence * 0.3)       // max 30 pts — consistency
  score += data.hasEmergencyFund ? 10 : 0               // 10 pts bonus
  return Math.min(Math.round(score), 100)
}

// Months until a goal is reached at current contribution rate
export const monthsToGoal = (goal: IGoal): number =>
  goal.monthlyContribution > 0
    ? Math.ceil((goal.targetAmount - goal.savedAmount) / goal.monthlyContribution)
    : Infinity

// Format currency using user locale
export const formatCurrency = (amount: number, currency: string, locale: string): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
```

---

## Pages Overview

### `/` — Dashboard
- SalaryOverview card: net salary / committed / free budget
- BudgetDonut: visual breakdown (fixed / variable / savings / free)
- AIInsightCard: one proactive insight, refreshed every 24h
- HealthScore: circular 0-100 indicator
- GoalsProgress: progress bars per active goal
- SpendingChart: bar chart spending by category this month
- QuickAdd floating button: fast expense entry

### `/expenses` — Expense Manager
- Tab toggle: Fixed vs Variable
- Expense list with category icons, amounts, due dates
- Add / Edit / Delete via RHF + Zod form in a shadcn Sheet
- Running total vs budget per category (progress bar + color indicator)

### `/goals` — Savings Goals
- Grid of goal cards with progress bars and projected completion date
- Add contribution, edit goal, mark complete
- AI hint: "At current rate you'll reach this in N months"

### `/debts` — Debt Tracker
- List: remaining balance, monthly payment, due day, payoff timeline
- Visual payoff progress bar

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
// lib/auth.ts
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

```typescript
// middleware.ts — protect all dashboard and API routes
export { auth as middleware } from '@/lib/auth'
export const config = {
  matcher: ['/(dashboard)/:path*', '/api/salary/:path*', '/api/expenses/:path*', '/api/goals/:path*', '/api/debts/:path*', '/api/ai/:path*'],
}
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

# Add a shadcn component
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add sheet
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add progress
npx shadcn@latest add tabs
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add dropdown-menu
npx shadcn@latest add separator
npx shadcn@latest add skeleton

# Build for production
npm run build
```

---

*Last updated: April 2026*
*Stack: Next.js 14 · TypeScript 5 · Tailwind CSS 3 · shadcn/ui · Mongoose 8 · NextAuth v5 · Groq llama-3.3-70b · Vercel AI SDK*
