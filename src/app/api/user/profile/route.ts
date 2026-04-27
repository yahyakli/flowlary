import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";
import { updateProfileSchema } from "@/lib/validations/user.schema";

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    await connectDB();
    
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { name: validatedData.name },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully", name: user.name });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
