import mongoose, { Schema, Model, models } from 'mongoose';

export interface IIncome {
  _id: mongoose.Types.ObjectId;
  userId: string;
  title: string;
  amount: number;
  category: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const incomeSchema = new Schema<IIncome>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, default: 'Other' },
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const Income: Model<IIncome> = models.Income || mongoose.model<IIncome>('Income', incomeSchema);

export { Income };
