import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Debt } from "@/lib/db/models/Debt";
import { debtSchema } from "@/lib/validations/debt.schema";
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

    const debt = await Debt.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!debt) {
      return NextResponse.json({ error: "Debt not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Debt deleted successfully" });
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
    const validatedData = debtSchema.partial().parse(body);

    await connectDB();

    // Fetch the current debt to check completion status
    const currentDebt = await Debt.findOne({ _id: id, userId: session.user.id });
    if (!currentDebt) {
      return NextResponse.json({ error: "Debt not found" }, { status: 404 });
    }

    const updatedData: any = { ...validatedData };

    // Recalculate isCompleted if remainingAmount changed
    const remaining = validatedData.remainingAmount ?? currentDebt.remainingAmount;
    updatedData.isCompleted = remaining <= 0;

    const debt = await Debt.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: updatedData },
      { new: true }
    );

    return NextResponse.json(debt);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
