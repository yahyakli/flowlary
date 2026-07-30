import mongoose, { Schema, Model, models } from 'mongoose';

export type RecurringRuleType = 'income' | 'expense';
export type RecurringRuleFrequency = 'monthly' | 'weekly';

export interface IRecurringRule {
  _id: mongoose.Types.ObjectId;
  userId: string;
  type: RecurringRuleType;
  category?: string;
  amount: number;
  description: string;
  frequency: RecurringRuleFrequency;
  nextRunDate: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const recurringRuleSchema = new Schema<IRecurringRule>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String },
    amount: { type: Number, required: true, min: 0.01 },
    description: { type: String, required: true },
    frequency: { type: String, enum: ['monthly', 'weekly'], required: true },
    nextRunDate: { type: Date, required: true, index: true },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Compound index to efficiently find due, active rules.
recurringRuleSchema.index({ active: 1, nextRunDate: 1 });

const RecurringRule: Model<IRecurringRule> =
  models.RecurringRule || mongoose.model<IRecurringRule>('RecurringRule', recurringRuleSchema);

export { RecurringRule };