import mongoose from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const session = {
    withTransaction: vi.fn(async (callback: () => Promise<void>) => callback()),
    endSession: vi.fn().mockResolvedValue(undefined),
  };
  const goal = {
    currentSaved: 325,
    save: vi.fn(),
  };

  return {
    connectDB: vi.fn().mockResolvedValue(undefined),
    startSession: vi.fn().mockResolvedValue(session),
    postLedgerEntry: vi.fn().mockResolvedValue({}),
    findOne: vi.fn(() => ({ session: async () => goal })),
    goal,
    session,
    reset: () => {
      goal.currentSaved = 325;
      goal.save.mockResolvedValue(goal);
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
vi.mock('../db/models/Goal', () => ({ Goal: { findOne: mocks.findOne } }));
vi.mock('./postEntry', () => ({ postLedgerEntry: mocks.postLedgerEntry }));

import { recordGoalContribution } from './goalActions';

describe('recordGoalContribution', () => {
  beforeEach(() => {
    mocks.reset();
  });

  it('posts a goal-contribution ledger entry and increases the stored goal balance', async () => {
    const userId = new mongoose.Types.ObjectId();
    const goalId = new mongoose.Types.ObjectId();

    const goal = await recordGoalContribution(userId, goalId, 125, 'Vacation fund');

    expect(goal.currentSaved).toBe(450);
    expect(mocks.goal.save).toHaveBeenCalledWith({ session: mocks.session });
    expect(mocks.postLedgerEntry).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        type: 'goal_contribution',
        amountOut: 125,
        sourceRefId: goalId,
        note: 'Vacation fund',
      }),
      { session: mocks.session }
    );
  });
});
