import mongoose from 'mongoose';

export interface ISalary {
  _id: mongoose.Types.ObjectId;
  userId: string;
  amount: number;
  frequency: 'monthly' | 'biweekly' | 'weekly';
  payDay: number;
  initialBalance: number;
  effectiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
