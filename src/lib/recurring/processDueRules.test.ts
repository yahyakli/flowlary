import mongoose from 'mongoose';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { addWeeks, addMonths } from 'date-fns';

vi.mock('../db/mongoose', () => ({ default: vi.fn() }));
vi.mock('../db/models/RecurringRule', () => ({
  RecurringRule: {
    find: vi.fn(),
    updateOne: vi.fn(),
  },
}));
vi.mock('../db/models/PendingDraft', () => ({
  PendingDraft: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

const connectDB = (await import('../db/mongoose')).default;
const { RecurringRule } = await import('../db/models/RecurringRule');
const { PendingDraft } = await import('../db/models/PendingDraft');
const { processDueRules } = await import('./processDueRules');

const mockedConnectDB = vi.mocked(connectDB);
const mockedRecurringRule = vi.mocked(RecurringRule);
const mockedPendingDraft = vi.mocked(PendingDraft);

const userId = '64f1234d8f4a2f12a3456789';
const ruleId = new mongoose.Types.ObjectId();
const now = new Date('2026-08-01T00:00:00.000Z');

const dueRule = {
  _id: ruleId,
  userId,
  type: 'expense' as const,
  category: 'Subscriptions',
  amount: 12.99,
  description: 'Netflix subscription',
  frequency: 'monthly' as const,
  nextRunDate: new Date('2026-08-01T00:00:00.000Z'),
  active: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedConnectDB.mockResolvedValue(undefined as any);
  mockedRecurringRule.updateOne.mockResolvedValue({ matchedCount: 1 } as any);
});

describe('processDueRules', () => {
  it('creates a pending draft for a due rule and advances nextRunDate', async () => {
    mockedRecurringRule.find.mockImplementationOnce(
      () =>
        ({
          lean: async () => [dueRule],
        }) as any
    );
    mockedPendingDraft.findOne.mockImplementationOnce(
      () =>
        ({
          lean: async () => null,
        }) as any
    );
    mockedPendingDraft.create.mockResolvedValueOnce({} as any);

    const result = await processDueRules(now);

    expect(result.processed).toBe(1);
    expect(result.draftsCreated).toBe(1);
    expect(result.skipped).toBe(0);
    expect(mockedPendingDraft.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        ruleId,
        type: 'expense',
        amount: 12.99,
        status: 'pending',
      })
    );
    expect(mockedRecurringRule.updateOne).toHaveBeenCalledWith(
      { _id: ruleId },
      { $set: { nextRunDate: addMonths(dueRule.nextRunDate, 1) } }
    );
  });

  it('skips creating a draft when one already exists (idempotency)', async () => {
    mockedRecurringRule.find.mockImplementationOnce(
      () =>
        ({
          lean: async () => [dueRule],
        }) as any
    );
    mockedPendingDraft.findOne.mockImplementationOnce(
      () =>
        ({
          lean: async () => ({ _id: new mongoose.Types.ObjectId() }),
        }) as any
    );

    const result = await processDueRules(now);

    expect(result.draftsCreated).toBe(0);
    expect(result.skipped).toBe(1);
    expect(mockedPendingDraft.create).not.toHaveBeenCalled();
    // nextRunDate should still be advanced
    expect(mockedRecurringRule.updateOne).toHaveBeenCalled();
  });

  it('advances weekly rules by 7 days', async () => {
    const weeklyRule = { ...dueRule, frequency: 'weekly' as const };
    mockedRecurringRule.find.mockImplementationOnce(
      () =>
        ({
          lean: async () => [weeklyRule],
        }) as any
    );
    mockedPendingDraft.findOne.mockImplementationOnce(
      () =>
        ({
          lean: async () => null,
        }) as any
    );
    mockedPendingDraft.create.mockResolvedValueOnce({} as any);

    await processDueRules(now);

    expect(mockedRecurringRule.updateOne).toHaveBeenCalledWith(
      { _id: ruleId },
      { $set: { nextRunDate: addWeeks(weeklyRule.nextRunDate, 1) } }
    );
  });

  it('returns zero processed when no rules are due', async () => {
    mockedRecurringRule.find.mockImplementationOnce(
      () =>
        ({
          lean: async () => [],
        }) as any
    );

    const result = await processDueRules(now);

    expect(result.processed).toBe(0);
    expect(result.draftsCreated).toBe(0);
  });

  it('counts errors when draft creation fails for non-duplicate reasons', async () => {
    mockedRecurringRule.find.mockImplementationOnce(
      () =>
        ({
          lean: async () => [dueRule],
        }) as any
    );
    mockedPendingDraft.findOne.mockImplementationOnce(
      () =>
        ({
          lean: async () => null,
        }) as any
    );
    mockedPendingDraft.create.mockRejectedValueOnce(new Error('DB connection lost'));

    const result = await processDueRules(now);

    expect(result.errors).toBe(1);
    expect(result.draftsCreated).toBe(0);
  });
});