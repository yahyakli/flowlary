import mongoose from 'mongoose';

export interface IDebt {
  _id: mongoose.Types.ObjectId;
  userId: string;
  title: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  dueDay?: number;
  lender: string;
  isCompleted: boolean;
  name: string;
  originalAmount: number;
  currentBalance: number;
  interestPercent: number;
  minPayment: number;
  monthlyPayment: number;
  createdAt: Date;
  updatedAt: Date;
}
