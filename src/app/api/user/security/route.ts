import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";
import { updatePasswordSchema } from "@/lib/validations/user.schema";
import { compare, hash } from "bcryptjs";

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updatePasswordSchema.parse(body);

    await connectDB();
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await compare(validatedData.currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    const newPasswordHash = await hash(validatedData.newPassword, 12);
    user.passwordHash = newPasswordHash;
    await user.save();

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
