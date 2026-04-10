import mongoose, { Schema, Model, models } from 'mongoose';
import type { IGoal } from '../types';

const goalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    savedAmount: { type: Number, required: true, default: 0 },
    deadline: { type: Date, required: true },
    monthlyContribution: { type: Number, required: true },
    icon: { type: String, required: true, default: 'target' },
    color: { type: String, required: true, default: '#4f46e5' },
    isCompleted: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  }
);

const Goal: Model<IGoal> = models.Goal || mongoose.model<IGoal>('Goal', goalSchema);

export type { IGoal };
export { Goal };
