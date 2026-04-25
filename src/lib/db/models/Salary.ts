import mongoose, { Schema, Model, models } from 'mongoose';
import type { ISalary } from '../types/Salary';

const salarySchema = new Schema<ISalary>(
  {
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    frequency: {
      type: String,
      required: true,
      enum: ['monthly', 'biweekly', 'weekly'],
      default: 'monthly'
    },
    payDay: { type: Number, default: 1 },
    initialBalance: { type: Number, default: 0 },
    effectiveDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const Salary: Model<ISalary> = models.Salary || mongoose.model<ISalary>('Salary', salarySchema);

export { Salary };
