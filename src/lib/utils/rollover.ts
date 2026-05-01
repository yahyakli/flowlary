import connectDB from "@/lib/db/mongoose";
import { Expense } from "@/lib/db/models/Expense";
import { Goal } from "@/lib/db/models/Goal";

/**
 * Ensures that recurring expenses from the previous month are propagated to the current month.
 */
export async function ensureRecurringExpenses(userId: string, month: number, year: number) {
  await connectDB();

  // 1. Check if we already have recurring expenses for this month
  const currentRecurringCount = await Expense.countDocuments({
    userId,
    month,
    year,
    $or: [{ isRecurring: true }, { type: "fixed" }]
  });

  if (currentRecurringCount > 0) {
    return;
  }

  // 2. Find the previous month with recurring expenses
  // We look back up to 12 months
  let searchMonth = month;
  let searchYear = year;
  let sourceExpenses: any[] = [];

  for (let i = 0; i < 12; i++) {
    searchMonth--;
    if (searchMonth === 0) {
      searchMonth = 12;
      searchYear--;
    }

    const found = await Expense.find({
      userId,
      month: searchMonth,
      year: searchYear,
      $or: [{ isRecurring: true }, { type: "fixed" }]
    }).lean();

    if (found.length > 0) {
      sourceExpenses = found;
      break;
    }
  }

  if (sourceExpenses.length === 0) {
    return;
  }

  // 3. Duplicate them for the current month
  const newExpensesData = sourceExpenses.map(({ _id, createdAt, updatedAt, __v, month: m, year: y, ...rest }) => ({
    ...rest,
    month,
    year,
    userId
  }));

  // Use create for each to ensure timestamps and validation
  for (const data of newExpensesData) {
    await Expense.create(data);
  }
}

/**
 * Automatically accrues monthly contributions to savings goals when a new month starts.
 */
export async function ensureGoalContributions(userId: string, month: number, year: number) {
  await connectDB();

  const goals = await Goal.find({
    userId,
    isCompleted: false,
  });

  for (const goal of goals) {
    // If it was already processed for this month, skip
    if (goal.lastProcessedMonth === month && goal.lastProcessedYear === year) {
      continue;
    }

    // Determine if we should accrue
    const createdAt = new Date(goal.createdAt);
    const createdMonth = createdAt.getMonth() + 1;
    const createdYear = createdAt.getFullYear();

    let shouldAccrue = false;

    if (!goal.lastProcessedMonth) {
      // If it's a new month compared to when it was created, accrue
      if (year > createdYear || (year === createdYear && month > createdMonth)) {
        shouldAccrue = true;
      }
    } else {
      // If it's a new month compared to last processed, accrue
      if (year > goal.lastProcessedYear! || (year === goal.lastProcessedYear! && month > goal.lastProcessedMonth!)) {
        shouldAccrue = true;
      }
    }

    if (shouldAccrue) {
      goal.savedAmount += goal.monthlyContribution;
      if (goal.savedAmount >= goal.targetAmount) {
        goal.isCompleted = true;
      }
      goal.lastProcessedMonth = month;
      goal.lastProcessedYear = year;
      await goal.save();
    }
  }
}
