import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Goal } from "@/lib/db/models/Goal";
import { goalSchema } from "@/lib/validations/goal.schema";
import { ensureGoalContributions } from "@/lib/utils/rollover";

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

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const now = new Date();
    await connectDB();
    await ensureGoalContributions(session.user.id, now.getMonth() + 1, now.getFullYear());

    const goals = await Goal.find({ userId: session.user.id })
      .sort({ deadline: 1 })
      .lean();

    return NextResponse.json(goals);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const validatedData = goalSchema.parse(body);

    await connectDB();

    const now = new Date();
    const goal = await Goal.create({
      name: validatedData.name,
      title: validatedData.name,
      targetAmount: validatedData.targetAmount,
      currentSaved: validatedData.currentSaved,
      savedAmount: validatedData.currentSaved,
      deadline: validatedData.deadline,
      monthlyContribution: validatedData.monthlyContribution ?? 0,
      icon: validatedData.icon ?? 'target',
      color: validatedData.color ?? '#4f46e5',
      isCompleted: validatedData.currentSaved >= validatedData.targetAmount,
      lastProcessedMonth: now.getMonth() + 1,
      lastProcessedYear: now.getFullYear(),
      userId: session.user.id,
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError || (error as any)?.name === 'ZodError') {
      return validationErrorResponse((error as any).issues ?? (error as any).errors);
    }
    return serverErrorResponse(error);
  }
}
