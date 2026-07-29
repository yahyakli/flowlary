import mongoose from "mongoose";
import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Goal } from "@/lib/db/models/Goal";
import { goalSchema } from "@/lib/validations/goal.schema";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function notFoundResponse() {
  return NextResponse.json({ error: "Goal not found" }, { status: 404 });
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
    const goal = await Goal.findOne({ _id: id, userId: session.user.id }).lean();

    if (!goal) {
      return notFoundResponse();
    }

    return NextResponse.json(goal);
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
    const validatedData = goalSchema.partial().parse(body);

    await connectDB();

    const currentGoal = await Goal.findOne({ _id: id, userId: session.user.id });
    if (!currentGoal) {
      return notFoundResponse();
    }

    const updatedData: any = { ...validatedData };
    const target = validatedData.targetAmount ?? currentGoal.targetAmount;
    const saved = validatedData.currentSaved ?? currentGoal.currentSaved;
    updatedData.isCompleted = saved >= target;

    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: updatedData },
      { new: true }
    ).lean();

    if (!goal) {
      return notFoundResponse();
    }

    return NextResponse.json(goal);
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

    const goal = await Goal.findOneAndDelete({ _id: id, userId: session.user.id });
    if (!goal) {
      return notFoundResponse();
    }

    return NextResponse.json({ message: "Goal deleted successfully" });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
