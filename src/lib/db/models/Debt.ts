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
    dueDay: { type: Number, required: true, min: 1, max: 31 },
    lender: { type: String, required: true },
    isCompleted: { type: Boolean, required: true, default: false },
    name: { type: String, required: true, default: function (this: IDebt) { return this.title; } },
    originalAmount: {
      type: Number,
      required: true,
      default: function (this: IDebt) {
        return this.totalAmount;
      },
    },
    currentBalance: {
      type: Number,
      required: true,
      default: function (this: IDebt) {
        return this.remainingAmount;
      },
    },
    interestPercent: {
      type: Number,
      required: true,
      default: function (this: IDebt) {
        return this.interestRate;
      },
    },
    minPayment: {
      type: Number,
      required: true,
      default: function (this: IDebt) {
        return this.monthlyPayment;
      },
    },
  },
  {
    timestamps: true,
  }
);

// Delete the model if it exists to force a schema update
if (models.Debt) {
  mongoose.deleteModel('Debt');
}

const Debt: Model<IDebt> = mongoose.model<IDebt>('Debt', debtSchema);

export type { IDebt };
export { Debt };
