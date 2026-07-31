import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Expense } from "@/lib/db/models/Expense";
import { MAX_FILE_SIZE, saveUpload, isAllowedMimeType } from "@/lib/storage/gridfs";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function badRequestResponse(details: unknown) {
  return NextResponse.json({ error: "Invalid file upload", details }, { status: 400 });
}

function notFoundResponse() {
  return NextResponse.json({ error: "Expense not found" }, { status: 404 });
}

function serverErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal Server Error";
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Uploads an image/PDF attachment and stores it in MongoDB GridFS.
 *
 * Body: multipart/form-data with a `file` field.
 * Query: optional `expenseId` — when provided, the returned attachmentUrl is
 *        immediately set on that expense (must belong to the authenticated user).
 *
 * Returns: { attachmentUrl, filename, contentType, length }
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const expenseId = searchParams.get("expenseId");

    if (expenseId && !mongoose.isValidObjectId(expenseId)) {
      return badRequestResponse("expenseId must be a valid ObjectId");
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return badRequestResponse("No file uploaded. Please provide a 'file' field.");
    }

    if (!isAllowedMimeType(file.type)) {
      return badRequestResponse(
        `Unsupported file type '${file.type}'. Allowed types: image/jpeg, image/png, image/webp, image/gif, application/pdf.`
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return badRequestResponse(`File exceeds the ${MAX_FILE_SIZE / (1024 * 1024)} MB size limit.`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const stored = await saveUpload({
      userId: session.user.id,
      filename: file.name || "attachment",
      contentType: file.type,
      buffer,
    });

    // Optional: attach the uploaded file to an existing expense right away.
    if (expenseId) {
      const expense = await Expense.findOneAndUpdate(
        { _id: expenseId, userId: session.user.id },
        { $set: { attachmentUrl: stored.url } },
        { new: true }
      ).lean();

      if (!expense) {
        return notFoundResponse();
      }

      return NextResponse.json({
        attachmentUrl: stored.url,
        filename: stored.filename,
        contentType: stored.contentType,
        length: stored.length,
        expense,
      });
    }

    return NextResponse.json(
      {
        attachmentUrl: stored.url,
        filename: stored.filename,
        contentType: stored.contentType,
        length: stored.length,
      },
      { status: 201 }
    );
  } catch (error) {
    return serverErrorResponse(error);
  }
}