import mongoose from 'mongoose';
import connectDB from '../db/mongoose';
import { LedgerEntry } from '../db/models/LedgerEntry';
import { MonthlySnapshot, type IMonthlySnapshot, type IBudgetAlert } from '../db/models/MonthlySnapshot';
import { Budget } from '../db/models/Budget';

/**
 * Extract YYYY-MM string from a Date
 */
function getMonthString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Recompute a monthly snapshot from ledger entries for that month.
 * Upserts the snapshot to the database.
 */
export async function updateMonthlySnapshot(
  userId: mongoose.Types.ObjectId,
  date: Date,
  session?: mongoose.ClientSession
): Promise<IMonthlySnapshot> {
  await connectDB();

  const month = getMonthString(date);

  // Build date range for the month
  const startOfMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const endOfMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  // Query ledger entries for this user in this month
  const query = LedgerEntry.find({
    userId: userId.toString(),
    date: { $gte: startOfMonth, $lt: endOfMonth },
  });

  if (session) {
    query.session(session);
  }

  const entries = await query.lean().exec();

  // Compute aggregates
  let totalIncome = 0;
  let totalExpenses = 0;
  const expenseByCategory: Record<string, number> = {};

  for (const entry of entries) {
    totalIncome += entry.amountIn;
    totalExpenses += entry.amountOut;

    // Track expenses by category if category exists
    if (entry.category && entry.amountOut > 0) {
      expenseByCategory[entry.category] = (expenseByCategory[entry.category] ?? 0) + entry.amountOut;
    }
  }

  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? netBalance / totalIncome : 0;

  // Fetch budgets for this user to flag over-budget categories
  const budgetQuery = Budget.find({ userId: userId.toString() }).lean();
  if (session) {
    budgetQuery.session(session);
  }
  const budgets = await budgetQuery.exec();

  // Flag categories that exceed their budget for the month
  const budgetAlerts: IBudgetAlert[] = [];
  for (const budget of budgets) {
    const spent = expenseByCategory[budget.category] ?? 0;
    if (spent > budget.monthlyLimit) {
      budgetAlerts.push({
        category: budget.category,
        spent,
        limit: budget.monthlyLimit,
      });
    }
  }

  // Upsert the snapshot
  const snapshotQuery = MonthlySnapshot.findOneAndUpdate(
    { userId: userId.toString(), month },
    {
      userId,
      month,
      totalIncome,
      totalExpenses,
      netBalance,
      expenseByCategory,
      savingsRate,
      budgetAlerts,
      updatedAt: new Date(),
    },
    { upsert: true, new: true, session }
  );

  const snapshot = await snapshotQuery.exec();

  if (!snapshot) {
    throw new Error('Failed to upsert monthly snapshot.');
  }

  return snapshot;
}
