import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStoredFileInfo, openDownloadStream } from "@/lib/storage/gridfs";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function notFoundResponse() {
  return NextResponse.json({ error: "File not found" }, { status: 404 });
}

function serverErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal Server Error";
  return NextResponse.json({ error: message }, { status: 500 });
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Serves a stored attachment from MongoDB GridFS.
 * Only the user who uploaded the file can retrieve it.
 */
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

    const objectId = new mongoose.Types.ObjectId(id);
    const info = await getStoredFileInfo(objectId);

    if (!info || info.userId !== session.user.id) {
      return notFoundResponse();
    }

    const stream = await openDownloadStream(objectId);
    const body = await streamToBuffer(stream);

    return new NextResponse(new Uint8Array(body), {
      status: 200,
      headers: {
        "Content-Type": info.contentType ?? "application/octet-stream",
        "Content-Length": String(info.length),
        "Content-Disposition": `inline; filename="${encodeURIComponent(info.filename)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}