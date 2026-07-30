import mongoose from 'mongoose';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db/mongoose', () => ({ default: vi.fn() }));
vi.mock('@/lib/db/models/RecurringRule', () => ({
  RecurringRule: {
    find: vi.fn(),
    create: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));

const { auth } = await import('@/lib/auth');
const connectDB = (await import('@/lib/db/mongoose')).default;
const { RecurringRule } = await import('@/lib/db/models/RecurringRule');
const { GET: listRules, POST: createRule } = await import('./route');
const {
  GET: getRule,
  PATCH: updateRule,
  DELETE: deleteRule,
} = await import('./[id]/route');

const mockedAuth = vi.mocked(auth);
const mockedConnectDB = vi.mocked(connectDB);
const mockedRecurringRule = vi.mocked(RecurringRule);

const userId = '64f1234d8f4a2f12a3456789';
const ruleId = new mongoose.Types.ObjectId();
const rulePayload = {
  _id: ruleId,
  userId,
  type: 'expense' as const,
  category: 'Subscriptions',
  amount: 12.99,
  description: 'Netflix subscription',
  frequency: 'monthly' as const,
  nextRunDate: new Date('2026-08-01T00:00:00.000Z'),
  active: true,
  createdAt: new Date('2026-07-01T00:00:00.000Z'),
  updatedAt: new Date('2026-07-01T00:00:00.000Z'),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedAuth.mockResolvedValue({ user: { id: userId } } as any);
  mockedConnectDB.mockResolvedValue(undefined);
});

describe('RecurringRules API routes', () => {
  it('returns a list of rules for authenticated users', async () => {
    mockedRecurringRule.find.mockImplementationOnce(
      () =>
        ({
          sort: () => ({
            lean: async () => [rulePayload],
          }),
        }) as any
    );

    const response = await listRules();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      rules: [{ type: 'expense', amount: 12.99 }],
    });
  });

  it('returns 401 when unauthenticated', async () => {
    mockedAuth.mockResolvedValueOnce(null as any);
    const response = await listRules();
    expect(response.status).toBe(401);
  });

  it('returns validation errors when creating rule with invalid payload', async () => {
    const request = new Request('https://example.com', {
      method: 'POST',
      body: JSON.stringify({ type: 'invalid', amount: -1, description: '' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await createRule(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error', 'Validation failed');
    expect(body.details).toBeDefined();
  });

  it('creates a recurring rule', async () => {
    mockedRecurringRule.create.mockResolvedValueOnce(rulePayload as any);

    const request = new Request('https://example.com', {
      method: 'POST',
      body: JSON.stringify({
        type: 'expense',
        category: 'Subscriptions',
        amount: 12.99,
        description: 'Netflix subscription',
        frequency: 'monthly',
        nextRunDate: '2026-08-01T00:00:00.000Z',
      }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await createRule(request);
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      rule: { type: 'expense', amount: 12.99 },
    });
  });

  it('returns a single rule by id', async () => {
    mockedRecurringRule.findOne.mockImplementationOnce(
      () =>
        ({
          lean: async () => rulePayload,
        }) as any
    );

    const response = await getRule(new Request('https://example.com'), {
      params: Promise.resolve({ id: ruleId.toString() }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ rule: { amount: 12.99 } });
  });

  it('returns 404 for invalid object id', async () => {
    const response = await getRule(new Request('https://example.com'), {
      params: Promise.resolve({ id: 'not-an-id' }),
    });
    expect(response.status).toBe(404);
  });

  it('updates a rule', async () => {
    mockedRecurringRule.findOneAndUpdate.mockImplementationOnce(
      () =>
        ({
          lean: async () => ({ ...rulePayload, amount: 15.99 }),
        }) as any
    );

    const request = new Request('https://example.com', {
      method: 'PATCH',
      body: JSON.stringify({ amount: 15.99 }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await updateRule(request, {
      params: Promise.resolve({ id: ruleId.toString() }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ rule: { amount: 15.99 } });
  });

  it('deletes a rule', async () => {
    mockedRecurringRule.findOneAndDelete.mockResolvedValueOnce(rulePayload as any);

    const response = await deleteRule(new Request('https://example.com'), {
      params: Promise.resolve({ id: ruleId.toString() }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: 'Recurring rule deleted successfully',
    });
  });
});