import { test, expect, type Page } from "@playwright/test";

/**
 * End-to-end smoke test covering the core Flowlary finance workflow:
 *   register → income entry → expense entry → dashboard validation →
 *   debt creation → debt payment → debt balance validation.
 *
 * Prerequisites:
 *   - The app is running (npm run dev) on http://localhost:3000
 *   - .env.local is configured with MONGODB_URI / NEXTAUTH_SECRET / NEXTAUTH_URL
 *   - Playwright chromium installed (npx playwright install chromium)
 */

const INCOME_AMOUNT = 5000;
const EXPENSE_AMOUNT = 1500;
const DEBT_AMOUNT = 10000;
const DEBT_MONTHLY_PAYMENT = 2000;

// Set a fixed computer clock for stable month selection on the dashboard.
test.use({
  timezoneId: "UTC",
});

async function registerUser(page: Page, email: string, name: string, password: string) {
  await page.goto("/register");
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  // After successful registration the app navigates to /login
  await page.waitForURL("**/login", { timeout: 15_000 });
}

async function addIncome(page: Page, source: string, amount: string, notes: string) {
  // Open the Add Income dialog from the dashboard.
  await page.getByText("Add Money").click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog.getByLabel("Income Source").fill(source);
  await dialog.getByLabel("Amount (MAD)").fill(amount);
  await dialog.getByLabel("Notes").fill(notes);

  await dialog.getByRole("button", { name: "Boost Balance" }).click();

  // Dialog closes and a success toast appears.
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Income recorded!")).toBeVisible({ timeout: 10_000 });
}

async function addExpense(page: Page, description: string, amount: string, category: string, notes: string) {
  // Open the Add Expense dialog from the expenses page.
  await page.getByRole("button", { name: "Add Expense" }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog.getByPlaceholder("What did you spend on?").fill(description);
  await dialog.getByPlaceholder("0.00").fill(amount);

  // The category input is pre-filled with the default; replace it with the desired category.
  const categoryInput = dialog.getByPlaceholder("Search categories");
  await categoryInput.fill(category);
  await page.keyboard.press("Enter");

  await dialog.getByPlaceholder("Anything else?").fill(notes);

  await dialog.getByRole("button", { name: "Record" }).click();

  // Dialog closes after the expense is created.
  await expect(dialog).toBeHidden();
}

async function addDebt(page: Page, title: string, lender: string, total: string, remaining: string, monthly: string, interest: string, dueDay: string) {
  await page.goto("/debts");
  await page.getByRole("button", { name: "Add Debt" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog.getByLabel("Debt Title").fill(title);
  await dialog.getByLabel("Lender / Creditor").fill(lender);
  await dialog.getByLabel("Total Amount (MAD)").fill(total);
  await dialog.getByLabel("Remaining (MAD)").fill(remaining);
  await dialog.getByLabel("Monthly Payment (MAD)").fill(monthly);
  await dialog.getByLabel("Interest Rate (%)").fill(interest);
  await dialog.getByLabel("Due Day of Month").fill(dueDay);

  await dialog.getByRole("button", { name: "Add Debt" }).click();

  // The dialog closes and the new debt appears in the list.
  await expect(dialog).toBeHidden();
  await expect(page.getByText(title)).toBeVisible({ timeout: 10_000 });
}

test("full finance workflow: register, income, expense, dashboard, debt payment", async ({ page }) => {
  const uniqueId = Date.now();
  const email = `e2e-${uniqueId}@example.com`;
  const password = "StrongPass123!";
  const incomeSource = "Freelance Project";
  const expenseDescription = "Office Supplies";
  const expenseCategory = "Miscellaneous/Other";
  const debtTitle = "Car Loan";
  const debtLender = "Bank of Test";

  // ── 1. Register a brand-new account ────────────────────────────────
  await registerUser(page, email, "E2E Tester", password);

  // ── 2. Log in with the new account ─────────────────────────────────
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  // Redirected to the dashboard.
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Dashboard overview" })).toBeVisible();

  // ── 3. Submit an income entry ──────────────────────────────────────
  await addIncome(page, incomeSource, String(INCOME_AMOUNT), "E2E income entry");

  // ── 4. Submit an expense entry ─────────────────────────────────────
  await page.goto("/expenses");
  await page.waitForURL("**/expenses");
  await addExpense(page, expenseDescription, String(EXPENSE_AMOUNT), expenseCategory, "E2E expense entry");

  // Verify the expense appears in the transaction list.
  await expect(page.getByText(expenseDescription)).toBeVisible({ timeout: 10_000 });

  // ── 5. Navigate to the dashboard and verify the numbers ────────────
  await page.goto("/dashboard");
  await page.waitForURL("**/dashboard");

  // The dashboard fetches /api/dashboard which returns the monthly snapshot.
  // Income + Expense should be reflected in Total Income / Total Expenses.
  const incomeCard = page.locator("div").filter({ hasText: "Total Income" }).first();
  await expect(incomeCard).toContainText("MAD 5,000", { timeout: 10_000 });

  const expenseCard = page.locator("div").filter({ hasText: "Total Expenses" }).first();
  await expect(expenseCard).toContainText("MAD 1,500", { timeout: 10_000 });

  // Net Balance should be income - expense.
  const netBalanceCard = page.locator("div").filter({ hasText: "Net Balance" }).first();
  await expect(netBalanceCard).toContainText("MAD 3,500", { timeout: 10_000 });

  // ── 6. Create a debt ───────────────────────────────────────────────
  await addDebt(page, debtTitle, debtLender, String(DEBT_AMOUNT), String(DEBT_AMOUNT), String(DEBT_MONTHLY_PAYMENT), "5", "15");

  // Verify the outstanding balance is shown.
  await expect(page.getByText("MAD 10,000")).toBeVisible({ timeout: 10_000 });

  // ── 7. Make a debt payment ─────────────────────────────────────────
  // The "Pay" button pays min(currentBalance, monthlyPayment) = 2000.
  await page.getByRole("button", { name: "Pay" }).click();
  await expect(page.getByText("Payment recorded")).toBeVisible({ timeout: 10_000 });

  // Balance should update to 10,000 - 2,000 = 8,000 (optimistic + server).
  await expect(page.getByText("MAD 8,000")).toBeVisible({ timeout: 10_000 });
});