import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Goal } from "@/lib/db/models/Goal";
import { goalSchema } from "@/lib/validations/goal.schema";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const goal = await Goal.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Goal deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = goalSchema.partial().parse(body);

    await connectDB();

    // Fetch the current goal to check completion status
    const currentGoal = await Goal.findOne({ _id: id, userId: session.user.id });
    if (!currentGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const updatedData: any = { ...validatedData };
    
    // Recalculate isCompleted if targetAmount or savedAmount changed
    const target = validatedData.targetAmount ?? currentGoal.targetAmount;
    const saved = validatedData.savedAmount ?? currentGoal.savedAmount;
    updatedData.isCompleted = saved >= target;

    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: updatedData },
      { new: true }
    );

    return NextResponse.json(goal);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
