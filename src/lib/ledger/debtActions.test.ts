import mongoose from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const session = {
    withTransaction: vi.fn(async (callback: () => Promise<void>) => callback()),
    endSession: vi.fn().mockResolvedValue(undefined),
  };
  const debt = {
    currentBalance: 500,
    save: vi.fn(),
  };

  return {
    connectDB: vi.fn().mockResolvedValue(undefined),
    startSession: vi.fn().mockResolvedValue(session),
    postLedgerEntry: vi.fn().mockResolvedValue({}),
    findOne: vi.fn(() => ({ session: async () => debt })),
    debt,
    session,
    reset: () => {
      debt.currentBalance = 500;
      debt.save.mockResolvedValue(debt);
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
vi.mock('../db/models/Debt', () => ({ Debt: { findOne: mocks.findOne } }));
vi.mock('./postEntry', () => ({ postLedgerEntry: mocks.postLedgerEntry }));

import { recordDebtPayment } from './debtActions';

describe('recordDebtPayment', () => {
  beforeEach(() => {
    mocks.reset();
  });

  it('posts a debt-payment ledger entry and decreases the stored debt balance', async () => {
    const userId = new mongoose.Types.ObjectId();
    const debtId = new mongoose.Types.ObjectId();

    const debt = await recordDebtPayment(userId, debtId, 125, 'Extra payment');

    expect(debt.currentBalance).toBe(375);
    expect(mocks.debt.save).toHaveBeenCalledWith({ session: mocks.session });
    expect(mocks.postLedgerEntry).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        type: 'debt_payment',
        amountOut: 125,
        sourceRefId: debtId,
        note: 'Extra payment',
      }),
      { session: mocks.session }
    );
  });
});
