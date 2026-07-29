import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Expense } from "@/lib/db/models/Expense";
import { expenseSchema } from "@/lib/validations/expense.schema";
import { ZodError } from "zod";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function validationErrorResponse(details: unknown) {
  return NextResponse.json({ error: "Validation failed", details }, { status: 400 });
}

function notFoundResponse() {
  return NextResponse.json({ error: "Expense not found" }, { status: 404 });
}

function serverErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal Server Error";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    if (!mongoose.isValidObjectId(id)) {
      return notFoundResponse();
    }

    await connectDB();
    const expense = await Expense.findOne({ _id: id, userId: session.user.id }).lean();

    if (!expense) {
      return notFoundResponse();
    }

    return NextResponse.json({ expense });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    if (!mongoose.isValidObjectId(id)) {
      return notFoundResponse();
    }

    const body = await req.json();
    const validatedData = expenseSchema.partial().parse(body);

    const updatePayload: any = {
      ...validatedData,
    };

    if (validatedData.description) {
      updatePayload.title = validatedData.description;
    }

    if (validatedData.date) {
      updatePayload.month = validatedData.date.getMonth() + 1;
      updatePayload.year = validatedData.date.getFullYear();
    }

    await connectDB();

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: updatePayload },
      { new: true }
    ).lean();

    if (!expense) {
      return notFoundResponse();
    }

    return NextResponse.json({ expense });
  } catch (error) {
    if (error instanceof ZodError || (error as any)?.name === "ZodError") {
      return validationErrorResponse((error as any).issues ?? (error as any).errors);
    }
    return serverErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    if (!mongoose.isValidObjectId(id)) {
      return notFoundResponse();
    }

    await connectDB();

    const expense = await Expense.findOneAndDelete({ _id: id, userId: session.user.id });
    if (!expense) {
      return notFoundResponse();
    }

    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
