import mongoose from 'mongoose';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db/mongoose', () => ({ default: vi.fn() }));
vi.mock('@/lib/db/models/MonthlySnapshot', () => ({
  MonthlySnapshot: {
    findOne: vi.fn(),
    find: vi.fn(),
  },
}));

const { auth } = await import('@/lib/auth');
const connectDB = (await import('@/lib/db/mongoose')).default;
const { MonthlySnapshot } = await import('@/lib/db/models/MonthlySnapshot');
const { GET } = await import('./route');

const mockedAuth = vi.mocked(auth);
const mockedConnectDB = vi.mocked(connectDB);
const mockedMonthlySnapshot = vi.mocked(MonthlySnapshot as any);

const userId = '64fabcde1234567890abcdef';

beforeEach(() => {
  vi.clearAllMocks();
  mockedAuth.mockResolvedValue({ user: { id: userId } } as any);
  mockedConnectDB.mockResolvedValue(undefined);
});

describe('Dashboard API', () => {
  it('returns a monthly snapshot if present', async () => {
    const snapshot = {
      userId,
      month: '2024-01',
      totalIncome: 1000,
      totalExpenses: 300,
      netBalance: 700,
      expenseByCategory: { Food: 200, Transport: 100 },
      savingsRate: 0.7,
      updatedAt: new Date('2024-01-31T12:00:00Z'),
    };

    mockedMonthlySnapshot.findOne.mockImplementationOnce(() => ({
      lean: async () => snapshot,
    }) as any);

    const res = await GET(new Request('https://example.com?month=2024-01'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ month: '2024-01', totalIncome: 1000, totalExpenses: 300 });
  });

  it('returns zeroed defaults when no snapshot exists for the month', async () => {
    mockedMonthlySnapshot.findOne.mockImplementationOnce(() => ({
      lean: async () => null,
    }) as any);

    const res = await GET(new Request('https://example.com?month=2024-03'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ month: '2024-03', totalIncome: 0, totalExpenses: 0, netBalance: 0 });
  });

  it('aggregates all snapshots for month=all', async () => {
    const snaps = [
      {
        userId,
        month: '2024-01',
        totalIncome: 1000,
        totalExpenses: 300,
        netBalance: 700,
        expenseByCategory: { Food: 200, Transport: 100 },
        savingsRate: 0.7,
        updatedAt: new Date('2024-01-31T12:00:00Z'),
      },
      {
        userId,
        month: '2024-02',
        totalIncome: 1500,
        totalExpenses: 400,
        netBalance: 1100,
        expenseByCategory: { Food: 250, Utilities: 150 },
        savingsRate: 0.7333,
        updatedAt: new Date('2024-02-28T12:00:00Z'),
      },
    ];

    mockedMonthlySnapshot.find.mockImplementationOnce(() => ({
      lean: async () => snaps,
    }) as any);

    const res = await GET(new Request('https://example.com?month=all'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ month: 'all', totalIncome: 2500, totalExpenses: 700 });
    expect(body.expenseByCategory.Food).toBe(450);
    expect(body.expenseByCategory.Transport).toBe(100);
    expect(body.expenseByCategory.Utilities).toBe(150);
  });
});
