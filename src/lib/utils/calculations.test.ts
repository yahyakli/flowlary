import { describe, expect, it } from 'vitest';
import { calculateFinancialSummary, calculateHealthMetrics } from './calculations';
import type { IDebt, IExpense, IGoal } from '@/lib/db/types';

describe('financial calculations', () => {
  it('summarizes a selected month and excludes income outside that month', () => {
    const summary = calculateFinancialSummary(
      1000,
      100,
      [
        { amount: 50, date: '2026-07-10' },
        { amount: 500, date: '2026-08-01' },
      ],
      [
        { amount: 200, category: 'Housing', type: 'fixed', month: 7, year: 2026 },
        { amount: 100, category: 'Food', type: 'variable', month: 7, year: 2026 },
        { amount: 50, category: 'Savings', type: 'variable', month: 7, year: 2026 },
        { amount: 999, category: 'Food', type: 'variable', month: 8, year: 2026 },
      ] as IExpense[],
      [{ monthlyContribution: 100, isCompleted: false }] as IGoal[],
      [{ monthlyPayment: 150, isCompleted: false }] as IDebt[],
      7,
      2026
    );

    expect(summary).toMatchObject({
      extraIncome: 50,
      fixedExpenses: 200,
      variableExpenses: 100,
      savingsCategory: 50,
      savingsContributions: 100,
      debtPayments: 150,
      totalExpenses: 550,
      remaining: 650,
    });
  });

  it('calculates health metrics and identifies a sufficiently funded emergency goal', () => {
    const summary = calculateFinancialSummary(
      1000,
      0,
      [{ amount: 50, date: '2026-07-10' }],
      [
        { amount: 200, category: 'Housing', type: 'fixed', month: 7, year: 2026 },
        { amount: 100, category: 'Food', type: 'variable', month: 7, year: 2026 },
        { amount: 50, category: 'Savings', type: 'variable', month: 7, year: 2026 },
      ] as IExpense[],
      [{ monthlyContribution: 100, isCompleted: false }] as IGoal[],
      [{ monthlyPayment: 150, isCompleted: false }] as IDebt[],
      7,
      2026
    );

    const metrics = calculateHealthMetrics(summary, [
      { title: 'Emergency fund', savedAmount: 600, targetAmount: 1000 },
    ] as IGoal[]);

    expect(metrics).toEqual({
      savingsRate: 14.3,
      debtToIncomeRatio: 14.3,
      budgetAdherence: 57,
      hasEmergencyFund: true,
    });
  });
});
