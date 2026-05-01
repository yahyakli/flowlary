import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Goal } from "@/lib/db/models/Goal";
import { goalSchema } from "@/lib/validations/goal.schema";
import { NextResponse } from "next/server";
import { ensureGoalContributions } from "@/lib/utils/rollover";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    await connectDB();
    await ensureGoalContributions(session.user.id, now.getMonth() + 1, now.getFullYear());

    const goals = await Goal.find({ userId: session.user.id })
      .sort({ deadline: 1 })
      .lean();

    return NextResponse.json(goals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = goalSchema.parse(body);

    await connectDB();

    const now = new Date();
    const goal = await Goal.create({
      ...validatedData,
      userId: session.user.id,
      isCompleted: validatedData.savedAmount >= validatedData.targetAmount,
      lastProcessedMonth: now.getMonth() + 1,
      lastProcessedYear: now.getFullYear(),
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
