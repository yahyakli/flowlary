import mongoose from 'mongoose';

export interface IDebt {
  _id: mongoose.Types.ObjectId;
  userId: string;
  title: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  interestRate: number;
  dueDay?: number;
  lender: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
