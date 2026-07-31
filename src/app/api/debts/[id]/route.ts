import mongoose from "mongoose";
import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Debt } from "@/lib/db/models/Debt";
import { LedgerEntry } from "@/lib/db/models/LedgerEntry";
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

    const updatedData: Record<string, unknown> = { ...validatedData };
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
    if (error instanceof ZodError || (error as unknown as { name?: string })?.name === 'ZodError') {
      return validationErrorResponse((error as unknown as { issues?: unknown; errors?: unknown }).issues ?? (error as unknown as { errors?: unknown }).errors);
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

    const debt = await Debt.findOne({ _id: id, userId: session.user.id });
    if (!debt) {
      return notFoundResponse();
    }

    const debtId = new mongoose.Types.ObjectId(id);
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Reverse all debt_payment ledger entries for this debt so the dashboard
    // no longer counts them as expenses after deletion.
    const paymentEntries = await LedgerEntry.find({
      userId,
      type: 'debt_payment',
      sourceRefId: debtId,
    });

    const mongoSession = await mongoose.startSession();
    try {
      await mongoSession.withTransaction(async () => {
        for (const entry of paymentEntries) {
          await LedgerEntry.create(
            [
              {
                userId,
                type: 'correction',
                amountIn: entry.amountOut,
                amountOut: entry.amountIn,
                date: new Date(),
                category: entry.category,
                sourceRefId: entry.sourceRefId,
                note: `Debt deleted: ${debt.title}`,
                correctsEntryId: entry._id,
              },
            ],
            { session: mongoSession }
          );
        }

      await Debt.findOneAndDelete({ _id: id, userId: session.user!.id }).session(mongoSession);
      });
    } finally {
      await mongoSession.endSession();
    }

    return NextResponse.json({ message: 'Debt deleted successfully' });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
