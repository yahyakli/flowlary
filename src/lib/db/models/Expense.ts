import mongoose, { Schema, Model, models } from 'mongoose';
import { ExpenseCategory } from '../types/Expense';
import type { IExpense } from '../types/Expense';

const expenseSchema = new Schema<IExpense>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    category: {
      type: String,
      enum: Object.values(ExpenseCategory),
      required: true,
    },
    description: { type: String, required: true },
    notes: { type: String },
    amount: { type: Number, required: true },
    title: { type: String, default: '' },
    type: { type: String, enum: ['fixed', 'variable'], default: 'variable' },
    isRecurring: { type: Boolean, default: false },
    dueDay: { type: Number, min: 1, max: 31 },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    tags: { type: [String], default: [] },
    note: { type: String },
  },
  {
    timestamps: true,
  }
);

const Expense: Model<IExpense> = models.Expense || mongoose.model<IExpense>('Expense', expenseSchema);

export type { IExpense };
export { ExpenseCategory, Expense };
