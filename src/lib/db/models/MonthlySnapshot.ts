import mongoose, { Model, Schema, models } from 'mongoose';

export interface IBudgetAlert {
  category: string;
  spent: number;
  limit: number;
}

export interface IMonthlySnapshot {
  userId: mongoose.Types.ObjectId;
  month: string; // YYYY-MM format
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  expenseByCategory: Record<string, number>; // category -> amount
  savingsRate: number; // (totalIncome - totalExpenses) / totalIncome, or 0 if no income
  budgetAlerts: IBudgetAlert[]; // categories that exceeded their budget
  updatedAt: Date;
}

const monthlySnapshotSchema = new Schema<IMonthlySnapshot>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  month: { type: String, required: true }, // YYYY-MM format
  totalIncome: { type: Number, default: 0 },
  totalExpenses: { type: Number, default: 0 },
  netBalance: { type: Number, default: 0 },
  expenseByCategory: { type: Map, of: Number, default: new Map() },
  savingsRate: { type: Number, default: 0 },
  budgetAlerts: {
    type: [
      {
        category: String,
        spent: Number,
        limit: Number,
      },
    ],
    default: [],
  },
  updatedAt: { type: Date, default: Date.now },
});

// Compound index for efficient queries
monthlySnapshotSchema.index({ userId: 1, month: 1 }, { unique: true });

const MonthlySnapshot: Model<IMonthlySnapshot> =
  models.MonthlySnapshot || mongoose.model<IMonthlySnapshot>('MonthlySnapshot', monthlySnapshotSchema);

export { MonthlySnapshot };
