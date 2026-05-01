import { IExpense, ISalary, IGoal, IDebt } from "@/lib/db/types";

export interface FinancialSummary {
  salary: number;
  initialBalance: number;
  extraIncome: number;
  fixedExpenses: number;
  variableExpenses: number;
  savingsContributions: number; // Goals
  savingsCategory: number; // Expenses marked as 'savings'
  debtPayments: number;
  totalExpenses: number;
  remaining: number;
  currency: string;
}

/**
 * Calculates the financial summary for a given set of data.
 * Formula per user request: balance = start balance + salary - expenses - goals contributions + savings
 */
export function calculateFinancialSummary(
  salary: number,
  initialBalance: number,
  incomes: any[],
  expenses: IExpense[],
  goals: IGoal[],
  debts: IDebt[],
  month?: number,
  year?: number
): FinancialSummary {
  // Filter expenses and incomes to the target cycle
  const targetExpenses = month && year 
    ? expenses.filter(e => e.month === month && e.year === year)
    : expenses;

  const extraIncome = incomes
    .filter(inc => {
      if (!month || !year) return true;
      const d = new Date(inc.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    })
    .reduce((acc, inc) => acc + inc.amount, 0);

  // Split expenses into normal ones and 'savings' ones
  const normalExpenses = targetExpenses.filter(e => e.category.toLowerCase() !== 'savings');
  const savingsCategoryExpenses = targetExpenses.filter(e => e.category.toLowerCase() === 'savings');

  const fixedExpenses = normalExpenses
    .filter((e) => e.type === "fixed")
    .reduce((acc, e) => acc + e.amount, 0);

  const variableExpenses = normalExpenses
    .filter((e) => e.type === "variable")
    .reduce((acc, e) => acc + e.amount, 0);

  const savingsCategory = savingsCategoryExpenses.reduce((acc, e) => acc + e.amount, 0);

  const savingsContributions = goals
    .filter(g => !g.isCompleted)
    .reduce((acc, g) => acc + g.monthlyContribution, 0);

  const debtPayments = debts
    .filter((d) => !d.isCompleted)
    .reduce((acc, d) => acc + d.monthlyPayment, 0);

  // User formula: balance = start balance + salary + extraIncome - normalExpenses - goals + savingsCategory
  const totalIncome = salary + initialBalance + extraIncome;
  const totalCommitments = fixedExpenses + variableExpenses + savingsContributions + debtPayments;
  
  // We subtract normal expenses and goal contributions, but ADD back the savings category expenses 
  // (because they are "savings" the user wants to see in their balance)
  const remaining = totalIncome - totalCommitments + savingsCategory;

  return {
    salary,
    initialBalance,
    extraIncome,
    fixedExpenses,
    variableExpenses,
    savingsContributions,
    savingsCategory,
    debtPayments,
    totalExpenses: totalCommitments,
    remaining: Math.max(remaining, 0),
    currency: "MAD",
  };
}

export interface HealthMetrics {
  savingsRate: number;
  debtToIncomeRatio: number;
  budgetAdherence: number;
  hasEmergencyFund: boolean;
}

export function calculateHealthMetrics(
  summary: FinancialSummary,
  goals: IGoal[]
): HealthMetrics {
  const totalIncome = summary.salary + summary.extraIncome;
  // For health metrics, we treat savingsCategory and savingsContributions as total savings
  const totalSavings = summary.savingsContributions + summary.savingsCategory;
  const totalExpenses = summary.fixedExpenses + summary.variableExpenses;

  const savingsRate = totalIncome > 0
    ? (totalSavings / totalIncome) * 100
    : 0;

  const debtToIncomeRatio = totalIncome > 0
    ? (summary.debtPayments / totalIncome) * 100
    : 0;

  const budgetAdherence = totalIncome > 0
    ? Math.min(Math.round(((totalIncome - totalExpenses - summary.debtPayments) / totalIncome) * 100), 100)
    : 100;

  const hasEmergencyFund = goals.some(
    (g) =>
      g.title.toLowerCase().includes("emergency") &&
      g.savedAmount >= g.targetAmount * 0.5
  );

  return {
    savingsRate: Math.round(savingsRate * 10) / 10,
    debtToIncomeRatio: Math.round(debtToIncomeRatio * 10) / 10,
    budgetAdherence: Math.max(budgetAdherence, 0),
    hasEmergencyFund,
  };
}
