import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Expense } from "@/lib/db/models/Expense";
import { postLedgerEntry } from "@/lib/ledger/postEntry";
import { expenseSchema } from "@/lib/validations/expense.schema";
import { ZodError } from "zod";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function validationErrorResponse(details: unknown) {
  return NextResponse.json({ error: "Validation failed", details }, { status: 400 });
}

function serverErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal Server Error";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    await connectDB();
    const expenses = await Expense.find({ userId: session.user.id }).sort({ date: -1 }).lean();

    return NextResponse.json({ expenses });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validatedData = expenseSchema.parse(body);

    await connectDB();

    const date = validatedData.date ?? new Date();
    const expense = await Expense.create({
      userId: session.user.id,
      date,
      category: validatedData.category,
      description: validatedData.description,
      amount: validatedData.amount,
      notes: validatedData.notes,
      title: validatedData.description,
      type: "variable",
      isRecurring: false,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      tags: [],
      note: validatedData.notes,
    });

    try {
      await postLedgerEntry(new mongoose.Types.ObjectId(session.user.id), {
        type: "expense",
        amountOut: validatedData.amount,
        date,
        category: validatedData.category,
        note: validatedData.notes ?? validatedData.description,
      });
    } catch (ledgerError) {
      await Expense.deleteOne({ _id: expense._id });
      throw ledgerError;
    }

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError || (error as any)?.name === "ZodError") {
      return validationErrorResponse((error as any).issues ?? (error as any).errors);
    }
    return serverErrorResponse(error);
  }
}
