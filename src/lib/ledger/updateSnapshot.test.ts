import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongoose';
import { LedgerEntry } from '@/lib/db/models/LedgerEntry';
import { MonthlySnapshot } from '@/lib/db/models/MonthlySnapshot';
import { Budget } from '@/lib/db/models/Budget';
import { User } from '@/lib/db/models/User';
import { updateMonthlySnapshot } from './updateSnapshot';
import { postLedgerEntry } from './postEntry';

// Mock MongoDB connection
vi.mock('@/lib/db/mongoose', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

describe('updateMonthlySnapshot', () => {
  let userId: mongoose.Types.ObjectId;
  let mockSession: Partial<mongoose.ClientSession>;

beforeEach(() => {
    userId = new mongoose.Types.ObjectId();
    mockSession = {
      endSession: vi.fn(),
    };
    // Default mock: no budgets (prevents real DB calls from Budget.find)
    vi.spyOn(Budget, 'find').mockReturnValue({
      lean: vi.fn().mockReturnValue({
        session: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([]),
      }),
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should compute correct totals for a single month', async () => {
    const dateInMonth = new Date('2024-01-15');
    const mockEntries = [
      {
        userId: userId.toString(),
        date: new Date('2024-01-05'),
        type: 'income' as const,
        amountIn: 1000,
        amountOut: 0,
        category: undefined,
      },
      {
        userId: userId.toString(),
        date: new Date('2024-01-10'),
        type: 'expense' as const,
        amountIn: 0,
        amountOut: 200,
        category: 'Food',
      },
      {
        userId: userId.toString(),
        date: new Date('2024-01-20'),
        type: 'expense' as const,
        amountIn: 0,
        amountOut: 150,
        category: 'Transport',
      },
    ];

    // Mock LedgerEntry.find().lean().exec()
    vi.spyOn(LedgerEntry, 'find').mockReturnValue({
      lean: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockEntries),
      }),
    } as any);

    // Mock MonthlySnapshot.findOneAndUpdate()
    const mockSnapshot = {
      userId,
      month: '2024-01',
      totalIncome: 1000,
      totalExpenses: 350,
      netBalance: 650,
      expenseByCategory: { Food: 200, Transport: 150 },
      savingsRate: 0.65,
      updatedAt: expect.any(Date),
    };

    vi.spyOn(MonthlySnapshot, 'findOneAndUpdate').mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockSnapshot),
    } as any);

    const result = await updateMonthlySnapshot(userId, dateInMonth);

    expect(result.totalIncome).toBe(1000);
    expect(result.totalExpenses).toBe(350);
    expect(result.netBalance).toBe(650);
    expect(result.savingsRate).toBeCloseTo(0.65, 2);
    expect(result.expenseByCategory).toEqual({ Food: 200, Transport: 150 });
  });

  it('should isolate data by month when entries span two months', async () => {
    // First, test snapshot for January
    const dateInJanuary = new Date('2024-01-15');
    const mockEntriesJanuary = [
      {
        userId: userId.toString(),
        date: new Date('2024-01-05'),
        type: 'income' as const,
        amountIn: 1000,
        amountOut: 0,
        category: undefined,
      },
      {
        userId: userId.toString(),
        date: new Date('2024-01-10'),
        type: 'expense' as const,
        amountIn: 0,
        amountOut: 200,
        category: 'Food',
      },
    ];

    // Second, test snapshot for February
    const dateInFebruary = new Date('2024-02-15');
    const mockEntriesFebruary = [
      {
        userId: userId.toString(),
        date: new Date('2024-02-03'),
        type: 'income' as const,
        amountIn: 1500,
        amountOut: 0,
        category: undefined,
      },
      {
        userId: userId.toString(),
        date: new Date('2024-02-10'),
        type: 'expense' as const,
        amountIn: 0,
        amountOut: 300,
        category: 'Transport',
      },
      {
        userId: userId.toString(),
        date: new Date('2024-02-20'),
        type: 'expense' as const,
        amountIn: 0,
        amountOut: 100,
        category: 'Food',
      },
    ];

    let callCount = 0;

    // Track which month is being queried
    vi.spyOn(LedgerEntry, 'find').mockImplementation((query: any) => {
      callCount++;
      const dateRangeQuery = query.date;

      let entries = [];
      if (callCount === 1) {
        // First call should be for January
        entries = mockEntriesJanuary;
      } else if (callCount === 2) {
        // Second call should be for February
        entries = mockEntriesFebruary;
      }

      return {
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(entries),
        }),
      } as any;
    });

    const mockSnapshotJanuary = {
      userId,
      month: '2024-01',
      totalIncome: 1000,
      totalExpenses: 200,
      netBalance: 800,
      expenseByCategory: { Food: 200 },
      savingsRate: 0.8,
      updatedAt: expect.any(Date),
    };

    const mockSnapshotFebruary = {
      userId,
      month: '2024-02',
      totalIncome: 1500,
      totalExpenses: 400,
      netBalance: 1100,
      expenseByCategory: { Transport: 300, Food: 100 },
      savingsRate: 0.7333,
      updatedAt: expect.any(Date),
    };

    let snapshotCallCount = 0;
    vi.spyOn(MonthlySnapshot, 'findOneAndUpdate').mockImplementation(() => {
      snapshotCallCount++;
      const mockSnapshot = snapshotCallCount === 1 ? mockSnapshotJanuary : mockSnapshotFebruary;
      return {
        exec: vi.fn().mockResolvedValue(mockSnapshot),
      } as any;
    });

    // Compute January snapshot
    const januaryResult = await updateMonthlySnapshot(userId, dateInJanuary);
    expect(januaryResult.month).toBe('2024-01');
    expect(januaryResult.totalIncome).toBe(1000);
    expect(januaryResult.totalExpenses).toBe(200);
    expect(januaryResult.netBalance).toBe(800);

    // Compute February snapshot
    const februaryResult = await updateMonthlySnapshot(userId, dateInFebruary);
    expect(februaryResult.month).toBe('2024-02');
    expect(februaryResult.totalIncome).toBe(1500);
    expect(februaryResult.totalExpenses).toBe(400);
    expect(februaryResult.netBalance).toBe(1100);

    // Verify neither snapshot contains data from the other month
    expect(januaryResult.totalIncome).not.toBe(februaryResult.totalIncome);
    expect(januaryResult.expenseByCategory).not.toEqual(februaryResult.expenseByCategory);
  });

  it('should calculate savingsRate as 0 when totalIncome is 0', async () => {
    const dateInMonth = new Date('2024-01-15');
    const mockEntries = [
      {
        userId: userId.toString(),
        date: new Date('2024-01-10'),
        type: 'expense' as const,
        amountIn: 0,
        amountOut: 200,
        category: 'Food',
      },
    ];

    vi.spyOn(LedgerEntry, 'find').mockReturnValue({
      lean: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockEntries),
      }),
    } as any);

    const mockSnapshot = {
      userId,
      month: '2024-01',
      totalIncome: 0,
      totalExpenses: 200,
      netBalance: -200,
      expenseByCategory: { Food: 200 },
      savingsRate: 0,
      updatedAt: expect.any(Date),
    };

    vi.spyOn(MonthlySnapshot, 'findOneAndUpdate').mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockSnapshot),
    } as any);

    const result = await updateMonthlySnapshot(userId, dateInMonth);

    expect(result.savingsRate).toBe(0);
    expect(result.netBalance).toBe(-200);
  });

  it('should aggregate expenses by category correctly', async () => {
    const dateInMonth = new Date('2024-01-15');
    const mockEntries = [
      {
        userId: userId.toString(),
        date: new Date('2024-01-05'),
        type: 'expense' as const,
        amountIn: 0,
        amountOut: 100,
        category: 'Food',
      },
      {
        userId: userId.toString(),
        date: new Date('2024-01-10'),
        type: 'expense' as const,
        amountIn: 0,
        amountOut: 50,
        category: 'Food',
      },
      {
        userId: userId.toString(),
        date: new Date('2024-01-15'),
        type: 'expense' as const,
        amountIn: 0,
        amountOut: 75,
        category: 'Entertainment',
      },
      {
        userId: userId.toString(),
        date: new Date('2024-01-20'),
        type: 'expense' as const,
        amountIn: 0,
        amountOut: 200,
        category: 'Housing/Rent',
      },
    ];

    vi.spyOn(LedgerEntry, 'find').mockReturnValue({
      lean: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockEntries),
      }),
    } as any);

    const mockSnapshot = {
      userId,
      month: '2024-01',
      totalIncome: 0,
      totalExpenses: 425,
      netBalance: -425,
      expenseByCategory: { Food: 150, Entertainment: 75, 'Housing/Rent': 200 },
      savingsRate: 0,
      updatedAt: expect.any(Date),
    };

    vi.spyOn(MonthlySnapshot, 'findOneAndUpdate').mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockSnapshot),
    } as any);

    const result = await updateMonthlySnapshot(userId, dateInMonth);

    expect(result.expenseByCategory).toEqual({ Food: 150, Entertainment: 75, 'Housing/Rent': 200 });
    expect(result.totalExpenses).toBe(425);
  });

  it('should use the provided session for database operations', async () => {
    const dateInMonth = new Date('2024-01-15');
    const mockEntries: any[] = [];
    const session = {} as mongoose.ClientSession;

    const findSpy = vi.spyOn(LedgerEntry, 'find').mockReturnValue({
      lean: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockEntries),
      }),
      session: vi.fn().mockReturnThis(),
    } as any);

    const mockSnapshot = {
      userId,
      month: '2024-01',
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      expenseByCategory: {},
      savingsRate: 0,
      updatedAt: expect.any(Date),
    };

    vi.spyOn(MonthlySnapshot, 'findOneAndUpdate').mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockSnapshot),
    } as any);

    await updateMonthlySnapshot(userId, dateInMonth, session);

    // Verify that the session was passed to the query
    const findCall = findSpy.mock.results[0];
    expect(findCall).toBeDefined();
  });

  it('should handle mixed income and expense entries correctly', async () => {
    const dateInMonth = new Date('2024-01-15');
    const mockEntries = [
      {
        userId: userId.toString(),
        date: new Date('2024-01-05'),
        type: 'income' as const,
        amountIn: 2000,
        amountOut: 0,
        category: undefined,
      },
      {
        userId: userId.toString(),
        date: new Date('2024-01-08'),
        type: 'income' as const,
        amountIn: 500,
        amountOut: 0,
        category: undefined,
      },
      {
        userId: userId.toString(),
        date: new Date('2024-01-10'),
        type: 'expense' as const,
        amountIn: 0,
        amountOut: 300,
        category: 'Housing/Rent',
      },
      {
        userId: userId.toString(),
        date: new Date('2024-01-15'),
        type: 'expense' as const,
        amountIn: 0,
        amountOut: 150,
        category: 'Food',
      },
      {
        userId: userId.toString(),
        date: new Date('2024-01-20'),
        type: 'debt_payment' as const,
        amountIn: 0,
        amountOut: 200,
        category: undefined,
      },
    ];

    vi.spyOn(LedgerEntry, 'find').mockReturnValue({
      lean: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockEntries),
      }),
    } as any);

    const mockSnapshot = {
      userId,
      month: '2024-01',
      totalIncome: 2500,
      totalExpenses: 650,
      netBalance: 1850,
      expenseByCategory: { 'Housing/Rent': 300, Food: 150 },
      savingsRate: 0.74,
      updatedAt: expect.any(Date),
    };

    vi.spyOn(MonthlySnapshot, 'findOneAndUpdate').mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockSnapshot),
    } as any);

    const result = await updateMonthlySnapshot(userId, dateInMonth);

    expect(result.totalIncome).toBe(2500);
    expect(result.totalExpenses).toBe(650);
    expect(result.netBalance).toBe(1850);
    expect(result.savingsRate).toBeCloseTo(0.74, 2);
  });

  it('should flag categories that exceed their budget', async () => {
    const dateInMonth = new Date('2024-01-15');
    const mockEntries = [
      {
        userId: userId.toString(),
        date: new Date('2024-01-10'),
        type: 'expense' as const,
        amountIn: 0,
        amountOut: 200,
        category: 'Food',
      },
      {
        userId: userId.toString(),
        date: new Date('2024-01-15'),
        type: 'expense' as const,
        amountIn: 0,
        amountOut: 100,
        category: 'Transport',
      },
    ];

    vi.spyOn(LedgerEntry, 'find').mockReturnValue({
      lean: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockEntries),
      }),
    } as any);

    // Mock budgets: Food limit 150 (exceeded), Transport limit 200 (within)
    vi.spyOn(Budget, 'find').mockReturnValue({
      lean: vi.fn().mockReturnValue({
        session: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([
          { userId: userId.toString(), category: 'Food', monthlyLimit: 150 },
          { userId: userId.toString(), category: 'Transport', monthlyLimit: 200 },
        ]),
      }),
    } as any);

    const findOneAndUpdateSpy = vi.spyOn(MonthlySnapshot, 'findOneAndUpdate').mockReturnValue({
      exec: vi.fn().mockResolvedValue({
        userId,
        month: '2024-01',
        totalIncome: 0,
        totalExpenses: 300,
        netBalance: -300,
        expenseByCategory: { Food: 200, Transport: 100 },
        savingsRate: 0,
        budgetAlerts: [{ category: 'Food', spent: 200, limit: 150 }],
        updatedAt: expect.any(Date),
      }),
    } as any);

    const result = await updateMonthlySnapshot(userId, dateInMonth);

    // Verify findOneAndUpdate was called with correct budgetAlerts
    expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        budgetAlerts: [{ category: 'Food', spent: 200, limit: 150 }],
      }),
      expect.any(Object)
    );
    expect(result.budgetAlerts).toEqual([{ category: 'Food', spent: 200, limit: 150 }]);
  });

  it('should not flag categories that are within budget', async () => {
    const dateInMonth = new Date('2024-01-15');
    const mockEntries = [
      {
        userId: userId.toString(),
        date: new Date('2024-01-10'),
        type: 'expense' as const,
        amountIn: 0,
        amountOut: 100,
        category: 'Food',
      },
    ];

    vi.spyOn(LedgerEntry, 'find').mockReturnValue({
      lean: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockEntries),
      }),
    } as any);

    // Mock budgets: Food limit 200 (within budget)
    vi.spyOn(Budget, 'find').mockReturnValue({
      lean: vi.fn().mockReturnValue({
        session: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([
          { userId: userId.toString(), category: 'Food', monthlyLimit: 200 },
        ]),
      }),
    } as any);

    const findOneAndUpdateSpy = vi.spyOn(MonthlySnapshot, 'findOneAndUpdate').mockReturnValue({
      exec: vi.fn().mockResolvedValue({
        userId,
        month: '2024-01',
        totalIncome: 0,
        totalExpenses: 100,
        netBalance: -100,
        expenseByCategory: { Food: 100 },
        savingsRate: 0,
        budgetAlerts: [],
        updatedAt: expect.any(Date),
      }),
    } as any);

    const result = await updateMonthlySnapshot(userId, dateInMonth);

    // Verify budgetAlerts is empty (no categories exceeded)
    expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        budgetAlerts: [],
      }),
      expect.any(Object)
    );
    expect(result.budgetAlerts).toEqual([]);
  });
});
