import mongoose from 'mongoose';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  currency: string;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
}
