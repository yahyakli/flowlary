import mongoose, { Schema, Model, models } from 'mongoose';
import type { IDebt } from '../types';

const debtSchema = new Schema<IDebt>(
  {
    userId: { type: String, required: true },
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

// Delete the model if it exists to force a schema update
if (models.Debt) {
  delete (mongoose as any).models.Debt;
}

const Debt: Model<IDebt> = mongoose.model<IDebt>('Debt', debtSchema);

export type { IDebt };
export { Debt };
