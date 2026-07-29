import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import { MonthlySnapshot } from '@/lib/db/models/MonthlySnapshot';

function zeroSnapshot(userId: string, month: string | 'all') {
  return {
    userId,
    month,
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    expenseByCategory: {},
    savingsRate: 0,
    updatedAt: new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  await connectDB();

  const url = new URL(request.url);
  let monthParam = url.searchParams.get('month') ?? '';

  // Default to current month if not supplied
  if (!monthParam) {
    const now = new Date();
    monthParam = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  const userId = session.user.id;

  if (monthParam === 'all') {
    // Support both real Mongoose Query chains and test mocks where `lean` is an async function.
    const findQuery = MonthlySnapshot.find({ userId: userId.toString() }).lean();
    const snapshots = typeof (findQuery as any).exec === 'function' ? await (findQuery as any).exec() : await findQuery;

    if (!snapshots || snapshots.length === 0) {
      return new Response(JSON.stringify(zeroSnapshot(userId, 'all')), { status: 200 });
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    let latestUpdatedAt: Date | null = null;
    const expenseByCategory: Record<string, number> = {};

    for (const s of snapshots) {
      totalIncome += s.totalIncome ?? 0;
      totalExpenses += s.totalExpenses ?? 0;
      if (s.updatedAt) {
        const u = new Date(s.updatedAt);
        if (!latestUpdatedAt || u > latestUpdatedAt) latestUpdatedAt = u;
      }
      const map = s.expenseByCategory || {};
      // map may be plain object or Map
      if ((map as any).toObject && typeof (map as any).toObject === 'function') {
        // Mongoose Map
        Object.entries((map as any).toObject()).forEach(([k, v]) => {
          expenseByCategory[k] = (expenseByCategory[k] ?? 0) + (v as number);
        });
      } else {
        Object.entries(map as Record<string, number>).forEach(([k, v]) => {
          expenseByCategory[k] = (expenseByCategory[k] ?? 0) + (v as number);
        });
      }
    }

    const netBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? netBalance / totalIncome : 0;

    return new Response(
      JSON.stringify({
        userId,
        month: 'all',
        totalIncome,
        totalExpenses,
        netBalance,
        expenseByCategory,
        savingsRate,
        updatedAt: latestUpdatedAt ? latestUpdatedAt.toISOString() : new Date().toISOString(),
      }),
      { status: 200 }
    );
  }

  // Validate month param YYYY-MM
  if (!/^\d{4}-\d{2}$/.test(monthParam)) {
    return new Response(JSON.stringify({ error: 'Invalid month format' }), { status: 400 });
  }

  const findOneQuery = MonthlySnapshot.findOne({ userId: userId.toString(), month: monthParam }).lean();
  const snapshot = typeof (findOneQuery as any).exec === 'function' ? await (findOneQuery as any).exec() : await findOneQuery;

  if (!snapshot) {
    return new Response(JSON.stringify(zeroSnapshot(userId, monthParam)), { status: 200 });
  }

  // Normalize expenseByCategory to plain object
  let expenseByCategory: Record<string, number> = {};
  const map = snapshot.expenseByCategory || {};
  if ((map as any).toObject && typeof (map as any).toObject === 'function') {
    expenseByCategory = (map as any).toObject();
  } else {
    expenseByCategory = map as Record<string, number>;
  }

  return new Response(
    JSON.stringify({
      userId,
      month: snapshot.month,
      totalIncome: snapshot.totalIncome ?? 0,
      totalExpenses: snapshot.totalExpenses ?? 0,
      netBalance: snapshot.netBalance ?? 0,
      expenseByCategory,
      savingsRate: snapshot.savingsRate ?? 0,
      updatedAt: snapshot.updatedAt ? new Date(snapshot.updatedAt).toISOString() : new Date().toISOString(),
    }),
    { status: 200 }
  );
}
