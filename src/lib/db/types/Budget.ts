import mongoose from 'mongoose';

import { ExpenseCategory } from './Expense';

export interface IBudget {
  _id: mongoose.Types.ObjectId;
  userId: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  createdAt: Date;
  updatedAt: Date;
}