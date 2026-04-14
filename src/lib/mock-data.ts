// Mock data for dashboard analytics (replace with real API calls later)

export interface MonthlySpending {
  month: string;
  amount: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  color: string;
}

export interface RecentTransaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  type: 'fixed' | 'variable';
  icon: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  icon: string;
  color: string;
  monthlyContribution: number;
  deadline: string;
}

export interface DebtItem {
  id: string;
  title: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  interestRate: number;
  dueDay: number;
}

export interface HealthMetrics {
  savingsRate: number;
  debtToIncomeRatio: number;
  budgetAdherence: number;
  hasEmergencyFund: boolean;
}

// Mock monthly spending (last 6 months)
export const mockMonthlySpending: MonthlySpending[] = [
  { month: 'Nov', amount: 1850 },
  { month: 'Dec', amount: 2100 },
  { month: 'Jan', amount: 1650 },
  { month: 'Feb', amount: 1920 },
  { month: 'Mar', amount: 1780 },
  { month: 'Apr', amount: 1450 },
];

// Mock category breakdown for current month
export const mockCategoryBreakdown: CategoryBreakdown[] = [
  { category: 'Housing', amount: 800, color: '#06b6d4' },
  { category: 'Food', amount: 320, color: '#10b981' },
  { category: 'Transport', amount: 180, color: '#8b5cf6' },
  { category: 'Utilities', amount: 150, color: '#f59e0b' },
  { category: 'Subscriptions', amount: 85, color: '#ec4899' },
  { category: 'Entertainment', amount: 65, color: '#f97316' },
  { category: 'Healthcare', amount: 45, color: '#3b82f6' },
  { category: 'Other', amount: 105, color: '#64748b' },
];

// Mock recent transactions
export const mockRecentTransactions: RecentTransaction[] = [
  { id: '1', title: 'Rent Payment', category: 'Housing', amount: -800, date: 'Apr 1', type: 'fixed', icon: 'Home' },
  { id: '2', title: 'Grocery Store', category: 'Food', amount: -67.50, date: 'Apr 3', type: 'variable', icon: 'ShoppingCart' },
  { id: '3', title: 'Salary Deposit', category: 'Income', amount: 4200, date: 'Apr 1', type: 'fixed', icon: 'Banknote' },
  { id: '4', title: 'Gas Station', category: 'Transport', amount: -45, date: 'Apr 4', type: 'variable', icon: 'Car' },
  { id: '5', title: 'Netflix', category: 'Subscriptions', amount: -15.99, date: 'Apr 5', type: 'fixed', icon: 'Tv' },
  { id: '6', title: 'Restaurant', category: 'Food', amount: -32.80, date: 'Apr 5', type: 'variable', icon: 'Utensils' },
  { id: '7', title: 'Internet Bill', category: 'Utilities', amount: -59.99, date: 'Apr 6', type: 'fixed', icon: 'Wifi' },
  { id: '8', title: 'Pharmacy', category: 'Healthcare', amount: -22.50, date: 'Apr 7', type: 'variable', icon: 'Pill' },
];

// Mock savings goals
export const mockSavingsGoals: SavingsGoal[] = [
  {
    id: '1',
    title: 'Emergency Fund',
    targetAmount: 10000,
    savedAmount: 6500,
    icon: 'Shield',
    color: 'cyan',
    monthlyContribution: 500,
    deadline: 'Dec 2026',
  },
  {
    id: '2',
    title: 'Vacation',
    targetAmount: 3000,
    savedAmount: 1200,
    icon: 'Plane',
    color: 'violet',
    monthlyContribution: 200,
    deadline: 'Aug 2026',
  },
  {
    id: '3',
    title: 'New Laptop',
    targetAmount: 1500,
    savedAmount: 900,
    icon: 'Laptop',
    color: 'emerald',
    monthlyContribution: 150,
    deadline: 'May 2026',
  },
];

// Mock debts
export const mockDebts: DebtItem[] = [
  {
    id: '1',
    title: 'Student Loan',
    totalAmount: 25000,
    remainingAmount: 18500,
    monthlyPayment: 350,
    interestRate: 4.5,
    dueDay: 15,
  },
  {
    id: '2',
    title: 'Car Loan',
    totalAmount: 15000,
    remainingAmount: 9200,
    monthlyPayment: 280,
    interestRate: 3.2,
    dueDay: 20,
  },
];

// Mock financial summary
export const mockSummary = {
  salary: 4200,
  fixedExpenses: 1300,
  variableExpenses: 750,
  savingsContributions: 850,
  debtPayments: 630,
  remaining: 670,
  currency: 'MAD',
};

// Mock health metrics
export const mockHealthMetrics: HealthMetrics = {
  savingsRate: 20.2, // percentage of salary
  debtToIncomeRatio: 15, // percentage
  budgetAdherence: 87, // percentage
  hasEmergencyFund: true,
};

// Calculate health score (0-100)
export function calculateHealthScore(metrics: HealthMetrics): number {
  let score = 0;
  score += Math.min(metrics.savingsRate * 1.5, 30); // max 30 pts
  score += Math.max(30 - metrics.debtToIncomeRatio * 1.5, 0); // max 30 pts
  score += Math.round(metrics.budgetAdherence * 0.3); // max 30 pts
  score += metrics.hasEmergencyFund ? 10 : 0; // 10 pts bonus
  return Math.min(Math.round(score), 100);
}

// Get months to goal
export function monthsToGoal(goal: SavingsGoal): number {
  const remaining = goal.targetAmount - goal.savedAmount;
  return goal.monthlyContribution > 0
    ? Math.ceil(remaining / goal.monthlyContribution)
    : Infinity;
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'MAD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Get spending trend (up/down/stable)
export function getSpendingTrend(data: MonthlySpending[]): 'up' | 'down' | 'stable' {
  if (data.length < 2) return 'stable';
  const last = data[data.length - 1].amount;
  const prev = data[data.length - 2].amount;
  const change = ((last - prev) / prev) * 100;
  if (change > 5) return 'up';
  if (change < -5) return 'down';
  return 'stable';
}
