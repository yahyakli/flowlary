import mongoose from "mongoose";
import { ZodError, z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Goal } from "@/lib/db/models/Goal";
import { recordGoalContribution } from "@/lib/ledger/goalActions";

const contributeSchema = z.object({
  amount: z.number().positive('Contribution amount must be greater than 0'),
  note: z.string().optional(),
});

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function validationErrorResponse(details: unknown) {
  return NextResponse.json({ error: "Validation failed", details }, { status: 400 });
}

function notFoundResponse() {
  return NextResponse.json({ error: "Goal not found" }, { status: 404 });
}

function serverErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal Server Error";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    if (!mongoose.isValidObjectId(id)) {
      return notFoundResponse();
    }

    const body = await request.json();
    const validatedData = contributeSchema.parse(body);

    await connectDB();

    const goal = await Goal.findOne({ _id: id, userId: session.user.id }).lean();
    if (!goal) {
      return notFoundResponse();
    }

    const remaining = goal.targetAmount - goal.currentSaved;
    if (validatedData.amount > remaining) {
      return NextResponse.json(
        {
          error: "Over-contribution not allowed",
          details: `Contribution amount ${validatedData.amount} exceeds remaining goal amount ${remaining}.`,
        },
        { status: 400 }
      );
    }

    const updatedGoal = await recordGoalContribution(
      new mongoose.Types.ObjectId(session.user.id),
      new mongoose.Types.ObjectId(id),
      validatedData.amount,
      validatedData.note
    );

    return NextResponse.json(updatedGoal);
  } catch (error) {
    if (error instanceof ZodError || (error as any)?.name === "ZodError") {
      return validationErrorResponse((error as any).issues ?? (error as any).errors);
    }
    return serverErrorResponse(error);
  }
}
