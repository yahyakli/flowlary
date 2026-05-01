import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Expense } from "@/lib/db/models/Expense";
import { expenseSchema } from "@/lib/validations/expense.schema";
import { NextResponse } from "next/server";
import { ensureRecurringExpenses } from "@/lib/utils/rollover";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const monthStr = searchParams.get("month");
    const yearStr = searchParams.get("year");
    
    // Always trigger rollover for the current month
    await connectDB();
    await ensureRecurringExpenses(session.user.id, now.getMonth() + 1, now.getFullYear());

    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100"); // Increase limit to see more data
    const skip = (page - 1) * limit;

    const query: any = { userId: session.user.id };
    if (monthStr) query.month = parseInt(monthStr);
    if (yearStr) query.year = parseInt(yearStr);
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const expenses = await Expense.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Expense.countDocuments(query);

    return NextResponse.json({
      expenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = expenseSchema.parse(body);

    await connectDB();

    const expense = await Expense.create({
      ...validatedData,
      userId: session.user.id,
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
