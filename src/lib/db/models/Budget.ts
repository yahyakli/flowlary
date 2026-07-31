import mongoose, { Schema, Model, models } from 'mongoose';
import { ExpenseCategory } from '../types/Expense';
import type { IBudget } from '../types/Budget';

const budgetSchema = new Schema<IBudget>(
  {
    userId: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: Object.values(ExpenseCategory),
      required: true,
    },
    monthlyLimit: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
  }
);

// One budget per category per user
budgetSchema.index({ userId: 1, category: 1 }, { unique: true });

const Budget: Model<IBudget> = models.Budget || mongoose.model<IBudget>('Budget', budgetSchema);

export type { IBudget };
export { Budget, ExpenseCategory };