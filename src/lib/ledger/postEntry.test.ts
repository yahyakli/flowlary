import mongoose from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ILedgerEntry } from '../db/models/LedgerEntry';

const mocks = vi.hoisted(() => {
  const entries: ILedgerEntry[] = [];
  let transactionQueue = Promise.resolve();

  const session = {
    withTransaction: vi.fn((callback: () => Promise<void>) => {
      const transaction = transactionQueue.then(callback);
      transactionQueue = transaction.catch(() => undefined);
      return transaction;
    }),
    endSession: vi.fn().mockResolvedValue(undefined),
  };

  return {
    connectDB: vi.fn().mockResolvedValue(undefined),
    startSession: vi.fn().mockResolvedValue(session),
    updateOne: vi.fn().mockResolvedValue({ acknowledged: true, matchedCount: 1 }),
    findOne: vi.fn((filter: { userId: mongoose.Types.ObjectId }) => ({
      sort: () => ({
        session: async () =>
          entries
            .filter((entry) => entry.userId.equals(filter.userId))
            .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0],
      }),
    })),
    create: vi.fn(async (documents: ILedgerEntry[]) => {
      const [entry] = documents;
      const createdEntry = {
        ...entry,
        createdAt: new Date(),
      };
      entries.push(createdEntry);
      return [createdEntry];
    }),
    reset: () => {
      entries.length = 0;
      transactionQueue = Promise.resolve();
      session.withTransaction.mockClear();
      session.endSession.mockClear();
    },
    entries,
  };
});

vi.mock('../db/mongoose', () => ({ default: mocks.connectDB }));
vi.mock('mongoose', async (importOriginal) => {
  const actual = await importOriginal<typeof import('mongoose')>();

  return {
    ...actual,
    default: {
      ...actual.default,
      startSession: mocks.startSession,
    },
  };
});
vi.mock('../db/models/User', () => ({ User: { updateOne: mocks.updateOne } }));
vi.mock('../db/models/LedgerEntry', () => ({
  LedgerEntry: { findOne: mocks.findOne, create: mocks.create },
}));

import { postLedgerEntry } from './postEntry';

const userId = new mongoose.Types.ObjectId();

describe('postLedgerEntry', () => {
  beforeEach(() => {
    mocks.reset();
  });

  it('sets the first entry balance from its incoming and outgoing amounts', async () => {
    const entry = await postLedgerEntry(userId, {
      date: new Date('2026-07-01'),
      type: 'income',
      amountIn: 900,
      amountOut: 125,
    });

    expect(entry.resultingBalance).toBe(775);
  });

  it('adds a second entry onto the first entry balance', async () => {
    await postLedgerEntry(userId, {
      date: new Date('2026-07-01'),
      type: 'income',
      amountIn: 900,
      amountOut: 0,
    });

    const entry = await postLedgerEntry(userId, {
      date: new Date('2026-07-02'),
      type: 'expense',
      amountIn: 0,
      amountOut: 275,
    });

    expect(entry.resultingBalance).toBe(625);
  });

  it('serializes concurrent entries so the final balance includes both', async () => {
    await Promise.all([
      postLedgerEntry(userId, {
        date: new Date('2026-07-01'),
        type: 'income',
        amountIn: 900,
        amountOut: 0,
      }),
      postLedgerEntry(userId, {
        date: new Date('2026-07-02'),
        type: 'expense',
        amountIn: 0,
        amountOut: 275,
      }),
    ]);

    expect(mocks.entries).toHaveLength(2);
    expect(mocks.entries.at(-1)?.resultingBalance).toBe(625);
  });
});
