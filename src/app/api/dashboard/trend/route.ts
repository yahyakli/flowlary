import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import { MonthlySnapshot } from '@/lib/db/models/MonthlySnapshot';

function monthStringFromDate(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  await connectDB();

  const url = new URL(request.url);
  let monthsParam = url.searchParams.get('months');
  const months = Math.min(24, Math.max(1, monthsParam ? parseInt(monthsParam, 10) || 6 : 6));

  const now = new Date();
  const monthsList: string[] = [];
  for (let offset = months - 1; offset >= 0; offset--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    monthsList.push(monthStringFromDate(d));
  }

  // Query snapshots for these months
  const findQuery = MonthlySnapshot.find({ userId: session.user.id.toString(), month: { $in: monthsList } }).lean();
  const snapshots = typeof (findQuery as any).exec === 'function' ? await (findQuery as any).exec() : await findQuery;

  const map = new Map<string, any>();
  for (const s of snapshots || []) {
    map.set(s.month, s);
  }

  const results = monthsList.map((m) => {
    const s = map.get(m);
    if (!s) {
      return { month: m, totalIncome: 0, totalExpenses: 0, netBalance: 0 };
    }

    return {
      month: s.month,
      totalIncome: s.totalIncome ?? 0,
      totalExpenses: s.totalExpenses ?? 0,
      netBalance: s.netBalance ?? 0,
    };
  });

  return new Response(JSON.stringify(results), { status: 200 });
}
