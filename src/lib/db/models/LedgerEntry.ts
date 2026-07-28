import mongoose, { Model, Schema, models } from 'mongoose';

// This is an append-only ledger: entries are never mutated or deleted, only corrected via new correction entries.
export interface ILedgerEntry {
  userId: mongoose.Types.ObjectId;
  date: Date;
  type: 'income' | 'expense' | 'debt_payment' | 'goal_contribution' | 'correction';
  category?: string;
  sourceRefId?: mongoose.Types.ObjectId;
  amountIn: number;
  amountOut: number;
  resultingBalance: number;
  note?: string;
  correctsEntryId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ledgerEntrySchema = new Schema<ILedgerEntry>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true },
  type: {
    type: String,
    enum: ['income', 'expense', 'debt_payment', 'goal_contribution', 'correction'],
    required: true,
  },
  category: { type: String },
  sourceRefId: { type: Schema.Types.ObjectId },
  amountIn: { type: Number, default: 0 },
  amountOut: { type: Number, default: 0 },
  resultingBalance: { type: Number, required: true },
  note: { type: String },
  correctsEntryId: { type: Schema.Types.ObjectId, ref: 'LedgerEntry' },
  createdAt: { type: Date, default: Date.now },
});

ledgerEntrySchema.index({ userId: 1, date: 1, createdAt: 1 });

const LedgerEntry: Model<ILedgerEntry> =
  models.LedgerEntry || mongoose.model<ILedgerEntry>('LedgerEntry', ledgerEntrySchema);

export { LedgerEntry };
