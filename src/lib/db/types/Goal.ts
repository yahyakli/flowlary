import mongoose from 'mongoose';

export interface IGoal {
  _id: mongoose.Types.ObjectId;
  userId: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline: Date;
  monthlyContribution: number;
  icon: string;
  color: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
