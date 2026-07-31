import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Budget } from "@/lib/db/models/Budget";
import { budgetSchema } from "@/lib/validations/budget.schema";
import { ZodError } from "zod";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function validationErrorResponse(details: unknown) {
  return NextResponse.json({ error: "Validation failed", details }, { status: 400 });
}

function notFoundResponse() {
  return NextResponse.json({ error: "Budget not found" }, { status: 404 });
}

function serverErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal Server Error";
  return NextResponse.json({ error: message }, { status: 500 });
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
    const validatedData = budgetSchema.partial().parse(body);

    await connectDB();

    const budget = await Budget.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: validatedData },
      { new: true }
    ).lean();

    if (!budget) {
      return notFoundResponse();
    }

    return NextResponse.json({ budget });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error.issues);
    }

    // Check for ZodError-like errors (e.g. from zod coercion)
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      (error as { name: string }).name === "ZodError"
    ) {
      const err = error as { issues?: unknown; errors?: unknown };
      return validationErrorResponse(err.issues ?? err.errors);
    }

    // Handle duplicate key error (unique constraint on userId + category)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "A budget for this category already exists" },
        { status: 409 }
      );
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

    const budget = await Budget.findOneAndDelete({ _id: id, userId: session.user.id });
    if (!budget) {
      return notFoundResponse();
    }

    return NextResponse.json({ message: "Budget deleted successfully" });
  } catch (error) {
    return serverErrorResponse(error);
  }
}