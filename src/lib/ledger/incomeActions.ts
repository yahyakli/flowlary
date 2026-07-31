import mongoose from "mongoose";
import connectDB from "../db/mongoose";
import { Income, type IIncome } from "../db/models/Income";
import { postLedgerEntry } from "./postEntry";
import type { IncomeSchema } from "../validations/income.schema";

/**
 * Creates an Income document and posts a corresponding ledger entry.
 * If the ledger posting fails, the Income document is deleted to maintain consistency.
 */
export async function createIncomeEntry(
  userId: mongoose.Types.ObjectId,
  data: IncomeSchema
): Promise<IIncome> {
  await connectDB();

  const income = await Income.create({
    ...data,
    userId: userId.toString(),
    date: data.date ?? new Date(),
  });

  try {
    await postLedgerEntry(userId, {
      type: "income",
      amountIn: data.amount,
      date: income.date,
      note: data.notes,
      category: data.source,
    });
  } catch (ledgerError) {
    await Income.deleteOne({ _id: income._id });
    throw ledgerError;
  }

  return income;
}