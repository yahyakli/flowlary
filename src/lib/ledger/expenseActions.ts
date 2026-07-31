import mongoose from "mongoose";
import connectDB from "../db/mongoose";
import { Expense, type IExpense } from "../db/models/Expense";
import { postLedgerEntry } from "./postEntry";
import type { ExpenseSchema } from "../validations/expense.schema";

/**
 * Creates an Expense document and posts a corresponding ledger entry.
 * If the ledger posting fails, the Expense document is deleted to maintain consistency.
 */
export async function createExpenseEntry(
  userId: mongoose.Types.ObjectId,
  data: ExpenseSchema
): Promise<IExpense> {
  await connectDB();

  const date = data.date ?? new Date();
  const expense = await Expense.create({
    userId: userId.toString(),
    date,
    category: data.category,
    description: data.description,
    amount: data.amount,
    notes: data.notes,
    title: data.description,
    type: "variable",
    isRecurring: false,
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    tags: [],
    note: data.notes,
    ...(data.attachmentUrl ? { attachmentUrl: data.attachmentUrl } : {}),
  });

  try {
    await postLedgerEntry(userId, {
      type: "expense",
      amountOut: data.amount,
      date,
      category: data.category,
      note: data.notes ?? data.description,
    });
  } catch (ledgerError) {
    await Expense.deleteOne({ _id: expense._id });
    throw ledgerError;
  }

  return expense;
}