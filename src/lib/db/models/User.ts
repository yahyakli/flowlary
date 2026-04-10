import mongoose, { Schema, Model, models } from 'mongoose';
import type { IUser } from '../types';

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    currency: { type: String, required: true, default: 'USD' },
    locale: { type: String, required: true, default: 'en-US' },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = models.User || mongoose.model<IUser>('User', userSchema);

export type { IUser };
export { User };
