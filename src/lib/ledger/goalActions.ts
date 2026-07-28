import mongoose from 'mongoose';
import connectDB from '../db/mongoose';
import { Goal, type IGoal } from '../db/models/Goal';
import { postLedgerEntry } from './postEntry';

export async function recordGoalContribution(
  userId: mongoose.Types.ObjectId,
  goalId: mongoose.Types.ObjectId,
  amount: number,
  note?: string
): Promise<IGoal> {
  await connectDB();

  const session = await mongoose.startSession();

  try {
    let updatedGoal: IGoal | undefined;

    await session.withTransaction(async () => {
      const goal = await Goal.findOne({ _id: goalId, userId: userId.toString() }).session(session);

      if (!goal) {
        throw new Error('Goal not found.');
      }

      await postLedgerEntry(
        userId,
        {
          date: new Date(),
          type: 'goal_contribution',
          sourceRefId: goalId,
          amountOut: amount,
          note,
        },
        { session }
      );

      goal.currentSaved += amount;
      updatedGoal = await goal.save({ session });
    });

    if (!updatedGoal) {
      throw new Error('Goal contribution transaction completed without updating the goal.');
    }

    return updatedGoal;
  } finally {
    await session.endSession();
  }
}
