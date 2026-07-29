import { describe, it, expect, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/db/mongoose', () => ({ default: vi.fn() }));
vi.mock('@/lib/db/models/MonthlySnapshot', () => ({
  MonthlySnapshot: {
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

beforeEach(() => {
  vi.clearAllMocks();
  mockedAuth.mockResolvedValue({ user: { id: '64fabcd1234567890abcdeff' } } as any);
  mockedConnectDB.mockResolvedValue(undefined);
});

function monthStringFromDate(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

describe('Dashboard trend API', () => {
  it('returns the requested number of months (including zeroed months)', async () => {
    const now = new Date();
    const months = 6;

    // Build monthsList same as route (oldest->newest)
    const monthsList: string[] = [];
    for (let offset = months - 1; offset >= 0; offset--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
      monthsList.push(monthStringFromDate(d));
    }

    // Provide snapshots only for the last and third-to-last month
    const snaps = [
      {
        userId: '64fabcd1234567890abcdeff',
        month: monthsList[2],
        totalIncome: 1000,
        totalExpenses: 400,
        netBalance: 600,
      },
      {
        userId: '64fabcd1234567890abcdeff',
        month: monthsList[5],
        totalIncome: 1500,
        totalExpenses: 500,
        netBalance: 1000,
      },
    ];

    mockedMonthlySnapshot.find.mockImplementationOnce(() => ({
      lean: async () => snaps,
    }) as any);

    const res = await GET(new Request(`https://example.com?months=${months}`));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(months);

    // Ensure missing months are present and zeroed
    expect(body[0]).toHaveProperty('month', monthsList[0]);
    expect(body[0]).toMatchObject({ totalIncome: 0, totalExpenses: 0, netBalance: 0 });

    // Ensure provided snaps are in correct positions
    const idx2 = 2; // third-to-last
    expect(body[idx2]).toMatchObject({ month: monthsList[2], totalIncome: 1000, totalExpenses: 400 });

    const idxLast = months - 1;
    expect(body[idxLast]).toMatchObject({ month: monthsList[5], totalIncome: 1500, totalExpenses: 500 });
  });

  it('caps months at 24 and returns at most 24 entries', async () => {
    const monthsRequested = 100;
    // Return empty array from DB
    mockedMonthlySnapshot.find.mockImplementationOnce(() => ({
      lean: async () => [],
    }) as any);

    const res = await GET(new Request(`https://example.com?months=${monthsRequested}`));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.length).toBeLessThanOrEqual(24);
  });
});
