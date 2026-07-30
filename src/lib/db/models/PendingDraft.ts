import mongoose, { Schema, Model, models } from 'mongoose';
import type { RecurringRuleType } from './RecurringRule';

export type DraftStatus = 'pending' | 'confirmed' | 'dismissed';

export interface IPendingDraft {
  _id: mongoose.Types.ObjectId;
  userId: string;
  ruleId: mongoose.Types.ObjectId;
  type: RecurringRuleType;
  category?: string;
  amount: number;
  description: string;
  scheduledDate: Date;
  status: DraftStatus;
  createdAt: Date;
  updatedAt: Date;
}

const pendingDraftSchema = new Schema<IPendingDraft>(
  {
    userId: { type: String, required: true, index: true },
    ruleId: { type: Schema.Types.ObjectId, ref: 'RecurringRule', required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String },
    amount: { type: Number, required: true, min: 0.01 },
    description: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'dismissed'], default: 'pending' },
  },
  {
    timestamps: true,
  }
);

// Efficient lookup of pending drafts per user, and dedup guard per rule+date.
pendingDraftSchema.index({ userId: 1, status: 1, createdAt: -1 });
pendingDraftSchema.index({ ruleId: 1, scheduledDate: 1, status: 1 }, { unique: true });

const PendingDraft: Model<IPendingDraft> =
  models.PendingDraft || mongoose.model<IPendingDraft>('PendingDraft', pendingDraftSchema);

export { PendingDraft };