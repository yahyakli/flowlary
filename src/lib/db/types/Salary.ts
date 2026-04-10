import mongoose from 'mongoose';

export interface ISalary {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  frequency: 'monthly' | 'biweekly' | 'weekly';
  effectiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
