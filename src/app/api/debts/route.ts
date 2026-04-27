import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { Debt } from "@/lib/db/models/Debt";
import { debtSchema } from "@/lib/validations/debt.schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const debts = await Debt.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(debts);
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
    const validatedData = debtSchema.parse(body);

    await connectDB();
    const debt = await Debt.create({
      ...validatedData,
      userId: session.user.id,
    });

    return NextResponse.json(debt, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
