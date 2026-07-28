import mongoose from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface TestLedgerEntry {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  type: 'income' | 'expense' | 'debt_payment' | 'goal_contribution' | 'correction';
  amountIn: number;
  amountOut: number;
  resultingBalance: number;
  createdAt: Date;
  note?: string;
  correctsEntryId?: mongoose.Types.ObjectId;
  sourceRefId?: mongoose.Types.ObjectId;
  category?: string;
}

const mocks = vi.hoisted(() => {
  const entries: TestLedgerEntry[] = [];
  const session = {
    withTransaction: vi.fn(async (callback: () => Promise<void>) => callback()),
    endSession: vi.fn().mockResolvedValue(undefined),
  };

  return {
    entries,
    session,
    connectDB: vi.fn().mockResolvedValue(undefined),
    startSession: vi.fn().mockResolvedValue(session),
    findOne: vi.fn((filter: { _id: mongoose.Types.ObjectId; userId: mongoose.Types.ObjectId }) => ({
      session: async () =>
        entries.find(
          (entry) => entry._id?.equals(filter._id) && entry.userId.equals(filter.userId)
        ),
    })),
    postLedgerEntry: vi.fn(async (userId: mongoose.Types.ObjectId, input: TestLedgerEntry) => {
      const previousBalance = entries.at(-1)?.resultingBalance ?? 0;
      const entry = {
        ...input,
        userId,
        amountIn: input.amountIn ?? 0,
        amountOut: input.amountOut ?? 0,
        resultingBalance: previousBalance + (input.amountIn ?? 0) - (input.amountOut ?? 0),
        createdAt: new Date(),
      };
      entries.push(entry);
      return entry;
    }),
    reset: () => {
      entries.length = 0;
      session.withTransaction.mockClear();
      session.endSession.mockClear();
      mocks.postLedgerEntry.mockClear();
    },
  };
});

vi.mock('../db/mongoose', () => ({ default: mocks.connectDB }));
vi.mock('mongoose', async (importOriginal) => {
  const actual = await importOriginal<typeof import('mongoose')>();

  return {
    ...actual,
    default: { ...actual.default, startSession: mocks.startSession },
  };
});
vi.mock('../db/models/LedgerEntry', () => ({ LedgerEntry: { findOne: mocks.findOne } }));
vi.mock('./postEntry', () => ({ postLedgerEntry: mocks.postLedgerEntry }));

import { deleteLedgerEntry, editLedgerEntry } from './corrections';

describe('ledger corrections', () => {
  const userId = new mongoose.Types.ObjectId();
  const entryId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    mocks.reset();
    mocks.entries.push({
      _id: entryId,
      userId,
      date: new Date('2026-07-01'),
      type: 'income',
      amountIn: 100,
      amountOut: 0,
      resultingBalance: 100,
      createdAt: new Date('2026-07-01T09:00:00Z'),
      note: 'Original income',
    });
  });

  it('deletes by posting a reversal while leaving the original entry untouched', async () => {
    const original = mocks.entries[0];
    const originalSnapshot = { ...original };

    const correction = await deleteLedgerEntry(userId, entryId);

    expect(correction).toMatchObject({
      type: 'correction',
      amountIn: 0,
      amountOut: 100,
      correctsEntryId: entryId,
      resultingBalance: 0,
    });
    expect(mocks.entries.at(-1)?.resultingBalance).toBe(0);
    expect(original).toEqual(originalSnapshot);
  });

  it('edits by reversing the original and appending a corrected entry', async () => {
    const original = mocks.entries[0];
    const originalSnapshot = { ...original };

    const result = await editLedgerEntry(userId, entryId, {
      amountIn: 125,
      note: 'Corrected income',
    });

    expect(result.correction.resultingBalance).toBe(0);
    expect(result.entry).toMatchObject({
      type: 'income',
      amountIn: 125,
      amountOut: 0,
      note: 'Corrected income',
      correctsEntryId: entryId,
      resultingBalance: 125,
    });
    expect(mocks.entries.at(-1)?.resultingBalance).toBe(125);
    expect(original).toEqual(originalSnapshot);
  });
});
