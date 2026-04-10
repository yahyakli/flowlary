import mongoose, { Schema, Model, models } from 'mongoose';
import { ExpenseCategory } from '../types';
import type { IExpense } from '../types';

const expenseSchema = new Schema<IExpense>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: Object.values(ExpenseCategory),
      required: true,
    },
    type: {
      type: String,
      enum: ['fixed', 'variable'],
      required: true,
    },
    isRecurring: { type: Boolean, required: true, default: false },
    dueDay: { type: Number, min: 1, max: 31 },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    tags: { type: [String], default: [] },
    note: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const Expense: Model<IExpense> = models.Expense || mongoose.model<IExpense>('Expense', expenseSchema);

export type { IExpense };
export { ExpenseCategory, Expense };
