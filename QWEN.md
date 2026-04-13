# Flowlary — Qwen Code Context

## Project Overview

**Flowlary** is a fullstack personal finance web application built with Next.js (App Router). It's a salary-first budgeting tool that helps users manage their income, expenses, savings goals, and debts with AI-powered financial insights.

**Key differentiator:** Privacy-first manual entry (no bank linking), built around the salary cycle, with proactive Groq-powered AI advice. Works globally with any currency.

---

## Tech Stack

| Category | Technologies |
|---|---|
| **Framework** | Next.js 16.2.3 (App Router), React 19.2, TypeScript 5 |
| **Styling** | Tailwind CSS 3.x, shadcn/ui (Radix-based components) |
| **State Management** | Zustand (client), MongoDB (server) |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Authentication** | NextAuth v5 (Credentials + MongoDB adapter) |
| **AI** | Vercel AI SDK + Groq (`llama-3.3-70b-versatile`) |
| **Forms** | React Hook Form + Zod validation |
| **Charts** | Recharts |
| **UI** | Lucide icons, Sonner (toasts), next-themes (dark mode) |

---

## Project Structure

```
flowlary/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login & Register pages
│   │   ├── (dashboard)/         # Protected dashboard routes
│   │   │   ├── page.tsx         # Main dashboard overview
│   │   │   ├── expenses/        # Expense manager
│   │   │   ├── goals/           # Savings goals tracker
│   │   │   ├── debts/           # Debt tracker
│   │   │   ├── history/         # Monthly history & trends
│   │   │   └── settings/        # User profile & preferences
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   │   ├── auth/register/       # Registration endpoint
│   │   │   ├── salary/              # Salary CRUD
│   │   │   ├── expenses/            # Expense CRUD
│   │   │   ├── goals/               # Goals CRUD
│   │   │   ├── debts/               # Debts CRUD
│   │   │   └── ai/
│   │   │       ├── chat/            # Streaming AI chat
│   │   │       └── insights/        # Proactive AI analysis
│   │   ├── layout.tsx           # Root layout (theme, auth, navbar, footer)
│   │   ├── page.tsx             # Landing page
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                  # shadcn auto-generated components
│   │   ├── dashboard/           # SalaryOverview, BudgetDonut, HealthScore, etc.
│   │   ├── ai/                  # CopilotChat panel
│   │   ├── expenses/            # ExpenseForm, ExpenseList
│   │   ├── goals/               # GoalCard, GoalForm
│   │   └── layout/              # Navbar, Footer, ScrollToTop
│   ├── lib/
│   │   ├── db/
│   │   │   ├── mongoose.ts      # MongoDB connection singleton
│   │   │   ├── models/          # Mongoose schemas (User, Salary, Expense, Goal, Debt)
│   │   │   └── types/           # TypeScript type definitions
│   │   ├── ai/                  # Groq config & system prompts
│   │   ├── validations/         # Zod schemas
│   │   ├── utils/               # Currency formatting, calculations
│   │   ├── auth.ts              # NextAuth config
│   │   └── auth.config.ts
│   ├── store/                   # Zustand stores
│   └── middleware.ts            # NextAuth route protection
├── public/
├── .env.local                   # Environment variables (not committed)
└── [config files]
```

---

## Database Models

### User
- name, email (unique), passwordHash, currency (default: 'USD'), locale (default: 'en-US')

### Salary
- userId (ref: User), amount (net take-home), frequency (monthly/biweekly/weekly), effectiveDate

### Expense
- userId (ref: User), title, amount, category (12 types), type (fixed/variable), isRecurring, dueDay, month, year, tags, note

### Goal
- userId (ref: User), title, targetAmount, savedAmount, deadline, monthlyContribution, icon, color, isCompleted

### Debt
- userId (ref: User), title, totalAmount, remainingAmount, monthlyPayment, interestRate, dueDay, lender, isCompleted

---

## Environment Variables

Required in `.env.local`:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/flowlary
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Add shadcn/ui components
npx shadcn@latest add <component-name>
```

---

## Key Conventions

- **TypeScript:** All components use explicit prop interfaces
- **API routes:** Validate request body with Zod before DB operations
- **Mongoose:** Read queries use `.lean()` for performance
- **Response format:** Success `{ data: T, message?: string }`, Error `{ error: string, code?: string }`
- **Dates:** Stored as UTC in MongoDB, displayed in user locale on client
- **Currency:** Formatted via `Intl.NumberFormat`, never string concatenation
- **State:** Zustand stores hold UI state; MongoDB is always source of truth
- **Auth:** NextAuth v5 with credentials provider, JWT sessions, MongoDB adapter
- **Path alias:** `@/*` maps to `./src/*`

---

## AI Integration

- **Provider:** Groq via `@ai-sdk/groq` using `llama-3.3-70b-versatile` model
- **Features:**
  - Copilot Chat: Streaming conversation via `/api/ai/chat`
  - Proactive Insights: Dashboard analysis via `/api/ai/insights`
- **System prompts:** Include user's financial context (salary, expenses, goals, debts, health score)
- **Free tier:** ~30 RPM, ~500k tokens/day

---

## Authentication Flow

- **NextAuth v5** with Credentials provider
- Password hashing via `bcryptjs`
- Route protection via `middleware.ts` (matches dashboard and API routes)
- Session strategy: JWT

---

## UI/UX Features

- **Theme:** Dark mode support via `next-themes`
- **Layout:** Navbar, Footer, ScrollToTop, decorative background orbs
- **Components:** shadcn/ui (Radix-based), fully customizable
- **Charts:** Recharts for spending visualization
- **Toasts:** Sonner for notifications
- **Responsive:** Mobile-first Tailwind approach

---

## Important Notes

- **Next.js 16.2.3** is in use — always read the relevant guide in `node_modules/next/dist/docs/` before writing code, as APIs may differ from training data
- **React 19.2.4** has breaking changes from v18 — check documentation before implementing
- shadcn components added via CLI (`npx shadcn@latest add`), not npm install
- This version of Next.js may have breaking changes — heed deprecation notices
