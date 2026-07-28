import mongoose, { type ClientSession } from 'mongoose';
import connectDB from '../db/mongoose';
import { LedgerEntry, type ILedgerEntry } from '../db/models/LedgerEntry';
import { User } from '../db/models/User';

export type LedgerEntryInput = Omit<
  ILedgerEntry,
  'userId' | 'resultingBalance' | 'createdAt' | 'amountIn' | 'amountOut'
> & {
  amountIn?: number;
  amountOut?: number;
};

interface PostLedgerEntryOptions {
  session?: ClientSession;
}

function transactionsAreUnsupported(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return /Transaction numbers are only allowed on a replica set member or mongos/i.test(
    error.message
  );
}

export async function postLedgerEntry(
  userId: mongoose.Types.ObjectId,
  entryInput: LedgerEntryInput,
  options: PostLedgerEntryOptions = {}
): Promise<ILedgerEntry> {
  await connectDB();

  if (options.session) {
    try {
      return await createLedgerEntry(userId, entryInput, options.session);
    } catch (error) {
      if (transactionsAreUnsupported(error)) {
        // TODO: Require a MongoDB replica set for ledger posting; standalone MongoDB cannot prevent lost updates.
        throw new Error('Ledger posting requires MongoDB transactions, which need a replica set deployment.');
      }

      throw error;
    }
  }

  const session = await mongoose.startSession();

  try {
    let createdEntry: ILedgerEntry | undefined;

    await session.withTransaction(async () => {
      createdEntry = await createLedgerEntry(userId, entryInput, session);
    });

    if (!createdEntry) {
      throw new Error('Ledger entry transaction completed without creating an entry.');
    }

    return createdEntry;
  } catch (error) {
    if (transactionsAreUnsupported(error)) {
      // TODO: Require a MongoDB replica set for ledger posting; standalone MongoDB cannot prevent lost updates.
      throw new Error('Ledger posting requires MongoDB transactions, which need a replica set deployment.');
    }

    throw error;
  } finally {
    await session.endSession();
  }
}

async function createLedgerEntry(
  userId: mongoose.Types.ObjectId,
  entryInput: LedgerEntryInput,
  session: ClientSession
): Promise<ILedgerEntry> {
  // This per-user write makes concurrent postings conflict and retry as a single ledger chain.
  const lockResult = await User.updateOne(
    { _id: userId },
    { $set: { updatedAt: new Date() } },
    { session }
  );

  if (lockResult.matchedCount !== 1) {
    throw new Error('Cannot post a ledger entry for a user that does not exist.');
  }

  const previousEntry = await LedgerEntry.findOne({ userId }).sort({ createdAt: -1 }).session(session);
  const previousBalance = previousEntry?.resultingBalance ?? 0;
  const amountIn = entryInput.amountIn ?? 0;
  const amountOut = entryInput.amountOut ?? 0;

  const [createdEntry] = await LedgerEntry.create(
    [
      {
        userId,
        ...entryInput,
        amountIn,
        amountOut,
        resultingBalance: previousBalance + amountIn - amountOut,
      },
    ],
    { session }
  );

  return createdEntry;
}
