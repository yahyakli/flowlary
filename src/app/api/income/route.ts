import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Income } from "@/lib/db/models/Income";
import { createIncomeEntry } from "@/lib/ledger/incomeActions";
import { incomeSchema } from "@/lib/validations/income.schema";
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
    const incomes = await Income.find({ userId: session.user.id }).sort({ date: -1 }).lean();

    return NextResponse.json({ incomes });
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
    const validatedData = incomeSchema.parse(body);

    const income = await createIncomeEntry(
      new mongoose.Types.ObjectId(session.user.id),
      validatedData
    );

    return NextResponse.json({ income }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError || (error as any)?.name === "ZodError") {
      return validationErrorResponse((error as any).issues ?? (error as any).errors);
    }
    return serverErrorResponse(error);
  }
}
