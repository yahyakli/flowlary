# Flowlary - Project Context & Guidelines

Flowlary is a fullstack, privacy-first salary management application that uses AI to provide proactive financial advice. Unlike traditional trackers, it focuses on the salary cycle and manual entry rather than bank account linking.

## Project Overview

*   **Core Purpose:** Personal finance management focused on net take-home pay, fixed commitments, and variable spending.
*   **Key Differentiator:** Manual entry (no bank links), salary-cycle logic, and a Groq-powered AI Copilot.
*   **Primary Technologies:**
    *   **Framework:** Next.js 16 (App Router) with React 19.
    *   **Language:** TypeScript.
    *   **Styling:** Tailwind CSS with shadcn/ui components.
    *   **Database:** MongoDB Atlas with Mongoose ODM.
    *   **Authentication:** NextAuth.js (Auth.js) v5 with MongoDB adapter.
    *   **AI Layer:** Vercel AI SDK with Groq (`llama-3.3-70b-versatile`).
    *   **State Management:** Zustand.
    *   **Validation:** Zod + React Hook Form.

## Architecture

*   **App Router:** Organized by logical groups (`(auth)`, `(dashboard)`) and API routes (`/api/ai`, `/api/expenses`, etc.).
*   **Data Models:** Defined in `src/lib/db/models` (User, Salary, Expense, Goal, Debt).
*   **AI Integration:** Centralized in `src/lib/ai` (Groq config and system prompts).
*   **Logic & Utils:** Business logic for health scores and budget calculations reside in `src/lib/utils/calculations.ts`.
*   **Global State:** Managed via specialized stores in `src/store` (Salary, Expenses, AI).

## Building and Running

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

### Environment Variables
Required in `.env.local`:
*   `MONGODB_URI`: MongoDB connection string.
*   `NEXTAUTH_SECRET`: Secret for NextAuth.
*   `NEXTAUTH_URL`: Canonical URL of the app.
*   `GROQ_API_KEY`: API key from Groq Console.

## Development Conventions

*   **Surgical Updates:** When modifying files, preserve existing patterns and context. Adhere strictly to the established architecture.
*   **Type Safety:** Use TypeScript for all components and logic. Define explicit interfaces for props and API responses.
*   **API Validation:** Always use Zod to validate request bodies in API routes before processing data.
*   **Mongoose Usage:** Use `.lean()` for read-only queries to improve performance.
*   **UI Components:** Use shadcn/ui components. Add new ones via `npx shadcn@latest add <component>`.
*   **State Management:** Prefer server components for data fetching where possible; use Zustand for complex client-side interactions and UI state.
*   **Currency & Dates:**
    *   Format currency using `Intl.NumberFormat` (see `src/lib/utils/currency.ts`).
    *   Store dates as UTC in the database and format to the user's locale on the client.
*   **Authentication:** Use the `auth` helper from `@/lib/auth` for server-side session checks and the `middleware.ts` for route protection.

## Testing & Validation
*   Validate all financial calculations against `src/lib/utils/calculations.ts`.
*   Verify that AI prompts in `src/lib/ai/prompts.ts` are updated if user context data structures change.
*   Ensure NextAuth protection is maintained for all `/dashboard` and `/api` routes.
