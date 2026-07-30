import mongoose from 'mongoose';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db/mongoose', () => ({ default: vi.fn() }));
vi.mock('@/lib/db/models/PendingDraft', () => ({
  PendingDraft: {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));
vi.mock('@/lib/db/models/Income', () => ({
  Income: { create: vi.fn(), deleteOne: vi.fn() },
}));
vi.mock('@/lib/db/models/Expense', () => ({
  Expense: { create: vi.fn(), deleteOne: vi.fn() },
}));
vi.mock('@/lib/ledger/postEntry', () => ({ postLedgerEntry: vi.fn() }));

const { auth } = await import('@/lib/auth');
const connectDB = (await import('@/lib/db/mongoose')).default;
const { PendingDraft } = await import('@/lib/db/models/PendingDraft');
const { Income } = await import('@/lib/db/models/Income');
const { Expense } = await import('@/lib/db/models/Expense');
const { postLedgerEntry } = await import('@/lib/ledger/postEntry');
const { GET: listDrafts } = await import('./route');
const { PATCH: actionDraft } = await import('./[id]/route');

const mockedAuth = vi.mocked(auth);
const mockedConnectDB = vi.mocked(connectDB);
const mockedPendingDraft = vi.mocked(PendingDraft);
const mockedIncome = vi.mocked(Income);
const mockedExpense = vi.mocked(Expense);
const mockedPostLedgerEntry = vi.mocked(postLedgerEntry);

const userId = '64f1234d8f4a2f12a3456789';
const draftId = new mongoose.Types.ObjectId();
const ruleId = new mongoose.Types.ObjectId();

const expenseDraft = {
  _id: draftId,
  userId,
  ruleId,
  type: 'expense' as const,
  category: 'Subscriptions',
  amount: 12.99,
  description: 'Netflix subscription',
  scheduledDate: new Date('2026-08-01T00:00:00.000Z'),
  status: 'pending' as const,
  save: vi.fn().mockResolvedValue(undefined),
};

const incomeDraft = {
  _id: new mongoose.Types.ObjectId(),
  userId,
  ruleId,
  type: 'income' as const,
  category: 'Salary',
  amount: 5000,
  description: 'Monthly salary',
  scheduledDate: new Date('2026-08-01T00:00:00.000Z'),
  status: 'pending' as const,
  save: vi.fn().mockResolvedValue(undefined),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedAuth.mockResolvedValue({ user: { id: userId } } as any);
  mockedConnectDB.mockResolvedValue(undefined as any);
  expenseDraft.save = vi.fn().mockResolvedValue(undefined);
  incomeDraft.save = vi.fn().mockResolvedValue(undefined);
});

describe('Drafts API routes', () => {
  it('returns a list of pending drafts for authenticated users', async () => {
    mockedPendingDraft.find.mockImplementationOnce(
      () =>
        ({
          sort: () => ({
            lean: async () => [expenseDraft],
          }),
        }) as any
    );

    const response = await listDrafts();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      drafts: [{ type: 'expense', amount: 12.99 }],
    });
  });

  it('returns 401 when unauthenticated', async () => {
    mockedAuth.mockResolvedValueOnce(null as any);
    const response = await listDrafts();
    expect(response.status).toBe(401);
  });

  it('dismisses a pending draft', async () => {
    mockedPendingDraft.findOne.mockResolvedValueOnce(expenseDraft as any);

    const request = new Request('https://example.com', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'dismiss' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await actionDraft(request, {
      params: Promise.resolve({ id: draftId.toString() }),
    });

    expect(response.status).toBe(200);
    expect(expenseDraft.save).toHaveBeenCalled();
  });

  it('confirms an expense draft by posting to the ledger', async () => {
    mockedPendingDraft.findOne.mockResolvedValueOnce(expenseDraft as any);
    mockedExpense.create.mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() } as any);
    mockedPostLedgerEntry.mockResolvedValueOnce({} as any);

    const request = new Request('https://example.com', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'confirm' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await actionDraft(request, {
      params: Promise.resolve({ id: draftId.toString() }),
    });

    expect(response.status).toBe(200);
    expect(mockedExpense.create).toHaveBeenCalled();
    expect(mockedPostLedgerEntry).toHaveBeenCalledWith(
      expect.any(mongoose.Types.ObjectId),
      expect.objectContaining({ type: 'expense', amountOut: 12.99 })
    );
    expect(expenseDraft.save).toHaveBeenCalled();
  });

  it('confirms an income draft by posting to the ledger', async () => {
    mockedPendingDraft.findOne.mockResolvedValueOnce(incomeDraft as any);
    mockedIncome.create.mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() } as any);
    mockedPostLedgerEntry.mockResolvedValueOnce({} as any);

    const request = new Request('https://example.com', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'confirm' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await actionDraft(request, {
      params: Promise.resolve({ id: incomeDraft._id.toString() }),
    });

    expect(response.status).toBe(200);
    expect(mockedIncome.create).toHaveBeenCalled();
    expect(mockedPostLedgerEntry).toHaveBeenCalledWith(
      expect.any(mongoose.Types.ObjectId),
      expect.objectContaining({ type: 'income', amountIn: 5000 })
    );
  });

  it('returns 404 when draft is not found', async () => {
    mockedPendingDraft.findOne.mockResolvedValueOnce(null);

    const request = new Request('https://example.com', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'confirm' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await actionDraft(request, {
      params: Promise.resolve({ id: draftId.toString() }),
    });

    expect(response.status).toBe(404);
  });

  it('returns validation error for invalid action', async () => {
    const request = new Request('https://example.com', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'invalid' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await actionDraft(request, {
      params: Promise.resolve({ id: draftId.toString() }),
    });

    expect(response.status).toBe(400);
  });
});