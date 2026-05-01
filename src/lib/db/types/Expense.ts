import mongoose from 'mongoose';

export enum ExpenseCategory {
  Housing = 'housing',
  Utilities = 'utilities',
  Transportation = 'transportation',
  Food = 'food',
  Healthcare = 'healthcare',
  Insurance = 'insurance',
  Entertainment = 'entertainment',
  Education = 'education',
  Savings = 'savings',
  Debt = 'debt',
  Subscriptions = 'subscriptions',
  Personal = 'personal',
  Investment = 'investment',
  Miscellaneous = 'miscellaneous',
}

export interface IExpense {
  _id: mongoose.Types.ObjectId;
  userId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  type: 'fixed' | 'variable';
  isRecurring: boolean;
  dueDay?: number;
  month: number;
  year: number;
  tags: string[];
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}
