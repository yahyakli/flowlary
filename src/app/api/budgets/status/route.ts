import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Budget } from "@/lib/db/models/Budget";
import { MonthlySnapshot, type IMonthlySnapshot } from "@/lib/db/models/MonthlySnapshot";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function serverErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal Server Error";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    await connectDB();

    const url = new URL(request.url);
    let monthParam = url.searchParams.get("month") ?? "";

    // Default to current month if not supplied
    if (!monthParam) {
      const now = new Date();
      monthParam = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    }

    // Validate month param YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(monthParam)) {
      return NextResponse.json(
        { error: "Invalid month format. Use YYYY-MM." },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Fetch all budgets for the user
    const budgets = await Budget.find({ userId }).sort({ category: 1 }).lean();

    // Fetch the monthly snapshot for spending data
    const snapshotQuery = MonthlySnapshot.findOne({ userId, month: monthParam }).lean();
    const snapshot: IMonthlySnapshot | null =
      typeof (snapshotQuery as unknown as { exec?: unknown }).exec === "function"
        ? await (snapshotQuery as unknown as { exec: () => Promise<IMonthlySnapshot | null> }).exec()
        : await snapshotQuery;

    // Normalize expenseByCategory to a plain object
    let expenseByCategory: Record<string, number> = {};
    if (snapshot) {
      const map = snapshot.expenseByCategory as unknown;
      if (
        typeof map === "object" &&
        map !== null &&
        "toObject" in map &&
        typeof (map as { toObject: () => unknown }).toObject === "function"
      ) {
        expenseByCategory = (map as { toObject: () => Record<string, number> }).toObject();
      } else {
        expenseByCategory = (map as Record<string, number>) ?? {};
      }
    }

    // Build budget status per category
    const budgetStatuses = budgets.map((budget) => {
      const spent = expenseByCategory[budget.category] ?? 0;
      const limit = budget.monthlyLimit;
      const remaining = limit - spent;
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;
      const status = percentage >= 100 ? "over" : percentage >= 80 ? "warning" : "ok";

      return {
        _id: budget._id,
        category: budget.category,
        monthlyLimit: limit,
        spent,
        remaining,
        percentage: Math.round(percentage * 10) / 10,
        status,
      };
    });

    return NextResponse.json({ budgets: budgetStatuses, month: monthParam });
  } catch (error) {
    return serverErrorResponse(error);
  }
}