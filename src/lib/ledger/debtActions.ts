import mongoose from 'mongoose';
import connectDB from '../db/mongoose';
import { Debt, type IDebt } from '../db/models/Debt';
import { postLedgerEntry } from './postEntry';

export async function recordDebtPayment(
  userId: mongoose.Types.ObjectId,
  debtId: mongoose.Types.ObjectId,
  amount: number,
  note?: string
): Promise<IDebt> {
  await connectDB();

  const session = await mongoose.startSession();

  try {
    let updatedDebt: IDebt | undefined;

    await session.withTransaction(async () => {
      const debt = await Debt.findOne({ _id: debtId, userId: userId.toString() }).session(session);

      if (!debt) {
        throw new Error('Debt not found.');
      }

      await postLedgerEntry(
        userId,
        {
          date: new Date(),
          type: 'debt_payment',
          sourceRefId: debtId,
          amountOut: amount,
          note,
        },
        { session }
      );

      // TODO: Confirm whether debt overpayments should be rejected; until then, negative balances are allowed.
      debt.currentBalance -= amount;
      updatedDebt = await debt.save({ session });
    });

    if (!updatedDebt) {
      throw new Error('Debt payment transaction completed without updating the debt.');
    }

    return updatedDebt;
  } finally {
    await session.endSession();
  }
}
