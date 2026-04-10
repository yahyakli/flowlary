import mongoose, { Schema, Model, models } from 'mongoose';
import type { ISalary } from '../types';

const salarySchema = new Schema<ISalary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    frequency: {
      type: String,
      required: true,
      enum: ['monthly', 'biweekly', 'weekly'],
    },
    effectiveDate: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

const Salary: Model<ISalary> = models.Salary || mongoose.model<ISalary>('Salary', salarySchema);

export type { ISalary };
export { Salary };
