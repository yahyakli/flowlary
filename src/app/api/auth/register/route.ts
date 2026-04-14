export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import connectDB from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = registerSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message ?? "Invalid request body" },
        { status: 400 }
      );
    }

    const { name, email, password } = parseResult.data;

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json({ error: "Email already taken" }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      currency: "MAD",
      locale: "en-US",
    });

    const { passwordHash: _passwordHash, ...safeUser } = user.toObject();
    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Unable to create account" }, { status: 500 });
  }
}