import mongoose from 'mongoose';

export enum ExpenseCategory {
  Housing = 'Housing/Rent',
  Food = 'Food',
  Transport = 'Transport',
  Utilities = 'Utilities',
  Healthcare = 'Health/Gym',
  Education = 'Education',
  Entertainment = 'Entertainment',
  Subscriptions = 'Subscriptions',
  Clothing = 'Clothing',
  PersonalCare = 'Personal Care',
  PhoneInternet = 'Phone/Internet',
  Insurance = 'Insurance',
  Travel = 'Travel',
  GiftsDonations = 'Gifts/Donations',
  DebtPayment = 'Debt Payment',
  SavingsTransfer = 'Savings Transfer',
  MiscellaneousOther = 'Miscellaneous/Other',
}

export interface IExpense {
  _id: mongoose.Types.ObjectId;
  userId: string;
  date: Date;
  category: ExpenseCategory;
  description: string;
  amount: number;
  notes?: string;
  title?: string;
  type?: 'fixed' | 'variable';
  isRecurring?: boolean;
  dueDay?: number;
  month?: number;
  year?: number;
  tags?: string[];
  note?: string;
  attachmentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}