import mongoose from 'mongoose';

export interface IGoal {
  _id: mongoose.Types.ObjectId;
  userId: string;
  title: string;
  savedAmount: number;
  monthlyContribution: number;
  icon: string;
  color: string;
  isCompleted: boolean;
  lastProcessedMonth?: number;
  lastProcessedYear?: number;
  name: string;
  targetAmount: number;
  currentSaved: number;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
}
