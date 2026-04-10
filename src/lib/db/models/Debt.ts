import mongoose, { Schema, Model, models } from 'mongoose';
import type { IDebt } from '../types';

const debtSchema = new Schema<IDebt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
    monthlyPayment: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    dueDay: { type: Number, min: 1, max: 31 },
    lender: { type: String, required: true },
    isCompleted: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  }
);

const Debt: Model<IDebt> = models.Debt || mongoose.model<IDebt>('Debt', debtSchema);

export type { IDebt };
export { Debt };
