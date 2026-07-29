import mongoose from "mongoose";
import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Debt } from "@/lib/db/models/Debt";
import { debtSchema } from "@/lib/validations/debt.schema";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function notFoundResponse() {
  return NextResponse.json({ error: "Debt not found" }, { status: 404 });
}

function validationErrorResponse(details: unknown) {
  return NextResponse.json({ error: "Validation failed", details }, { status: 400 });
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
    const debt = await Debt.findOne({ _id: id, userId: session.user.id }).lean();

    if (!debt) {
      return notFoundResponse();
    }

    return NextResponse.json({ debt });
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

    const body = await req.json();
    if (Object.prototype.hasOwnProperty.call(body, 'currentBalance')) {
      return NextResponse.json(
        {
          error: 'Direct currentBalance updates are not allowed',
          details: 'Use the debt payment endpoint to adjust the current balance.',
        },
        { status: 400 }
      );
    }

    const validatedData = debtSchema.partial().parse(body);

    await connectDB();

    const currentDebt = await Debt.findOne({ _id: id, userId: session.user.id });
    if (!currentDebt) {
      return notFoundResponse();
    }

    const updatedData: any = { ...validatedData };
    const remaining = validatedData.remainingAmount ?? currentDebt.remainingAmount;
    updatedData.isCompleted = remaining <= 0;

    const debt = await Debt.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: updatedData },
      { new: true }
    ).lean();

    if (!debt) {
      return notFoundResponse();
    }

    return NextResponse.json({ debt });
  } catch (error) {
    if (error instanceof ZodError || (error as any)?.name === 'ZodError') {
      return validationErrorResponse((error as any).issues ?? (error as any).errors);
    }
    return serverErrorResponse(error);
  }
}

export async function DELETE(
  _req: Request,
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

    const debt = await Debt.findOneAndDelete({ _id: id, userId: session.user.id });
    if (!debt) {
      return notFoundResponse();
    }

    return NextResponse.json({ message: 'Debt deleted successfully' });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
