import mongoose from 'mongoose';
import connectDB from '../db/mongoose';
import { LedgerEntry, type ILedgerEntry } from '../db/models/LedgerEntry';
import { type LedgerEntryInput, postLedgerEntry } from './postEntry';
import { updateMonthlySnapshot } from './updateSnapshot';

export type LedgerEntryChanges = Partial<Omit<LedgerEntryInput, 'correctsEntryId'>>;

export async function deleteLedgerEntry(
  userId: mongoose.Types.ObjectId,
  entryId: mongoose.Types.ObjectId
): Promise<ILedgerEntry> {
  await connectDB();

  const session = await mongoose.startSession();

  try {
    let correction: ILedgerEntry | undefined;
    let originalEntry: ILedgerEntry | undefined;

    await session.withTransaction(async () => {
      originalEntry = await findUserEntry(userId, entryId, session);
      correction = await postReversal(userId, entryId, originalEntry, session);
      // Update snapshot for the original entry's month
      await updateMonthlySnapshot(userId, originalEntry.date, session);
    });

    if (!correction || !originalEntry) {
      throw new Error('Ledger deletion transaction completed without creating a correction.');
    }

    return correction;
  } finally {
    await session.endSession();
  }
}

export async function editLedgerEntry(
  userId: mongoose.Types.ObjectId,
  entryId: mongoose.Types.ObjectId,
  changes: LedgerEntryChanges
): Promise<{ correction: ILedgerEntry; entry: ILedgerEntry }> {
  await connectDB();

  const session = await mongoose.startSession();

  try {
    let correction: ILedgerEntry | undefined;
    let entry: ILedgerEntry | undefined;
    let originalEntry: ILedgerEntry | undefined;

    await session.withTransaction(async () => {
      originalEntry = await findUserEntry(userId, entryId, session);
      correction = await postReversal(userId, entryId, originalEntry, session);
      entry = await postLedgerEntry(
        userId,
        {
          date: changes.date ?? originalEntry.date,
          type: changes.type ?? originalEntry.type,
          category: valueOrOriginal(changes, 'category', originalEntry.category),
          sourceRefId: valueOrOriginal(changes, 'sourceRefId', originalEntry.sourceRefId),
          amountIn: changes.amountIn ?? originalEntry.amountIn,
          amountOut: changes.amountOut ?? originalEntry.amountOut,
          note: valueOrOriginal(changes, 'note', originalEntry.note),
          correctsEntryId: entryId,
        },
        { session }
      );
      // Update snapshots for both the original entry's month and the new entry's month
      // (postLedgerEntry above already updates the new entry's month, but we also need the original)
      if (originalEntry.date.getUTCMonth() !== (changes.date ?? originalEntry.date).getUTCMonth() ||
          originalEntry.date.getUTCFullYear() !== (changes.date ?? originalEntry.date).getUTCFullYear()) {
        await updateMonthlySnapshot(userId, originalEntry.date, session);
      }
    });

    if (!correction || !entry || !originalEntry) {
      throw new Error('Ledger edit transaction completed without creating both replacement entries.');
    }

    return { correction, entry };
  } finally {
    await session.endSession();
  }
}

async function findUserEntry(
  userId: mongoose.Types.ObjectId,
  entryId: mongoose.Types.ObjectId,
  session: mongoose.ClientSession
): Promise<ILedgerEntry> {
  const entry = await LedgerEntry.findOne({ _id: entryId, userId }).session(session);

  if (!entry) {
    throw new Error('Ledger entry not found.');
  }

  return entry;
}

function postReversal(
  userId: mongoose.Types.ObjectId,
  entryId: mongoose.Types.ObjectId,
  originalEntry: ILedgerEntry,
  session: mongoose.ClientSession
): Promise<ILedgerEntry> {
  return postLedgerEntry(
    userId,
    {
      date: new Date(),
      type: 'correction',
      sourceRefId: originalEntry.sourceRefId,
      amountIn: originalEntry.amountOut,
      amountOut: originalEntry.amountIn,
      note: originalEntry.note,
      correctsEntryId: entryId,
    },
    { session }
  );
}

function valueOrOriginal<T extends keyof LedgerEntryChanges>(
  changes: LedgerEntryChanges,
  field: T,
  originalValue: LedgerEntryChanges[T]
): LedgerEntryChanges[T] {
  return field in changes ? changes[field] : originalValue;
}
