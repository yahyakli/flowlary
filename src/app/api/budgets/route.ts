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
    const budgets = await Budget.find({ userId: session.user.id }).sort({ category: 1 }).lean();

    return NextResponse.json({ budgets });
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
    const validatedData = budgetSchema.parse(body);

    await connectDB();

    const budget = await Budget.create({
      userId: session.user.id,
      category: validatedData.category,
      monthlyLimit: validatedData.monthlyLimit,
    });

    return NextResponse.json({ budget }, { status: 201 });
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