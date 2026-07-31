import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { ObjectId, GridFSBucket } from "mongodb";
import { clientPromise } from "@/lib/db/mongoose";

const BUCKET_NAME = "attachments";

/** Maximum size for an uploaded attachment (5 MB). */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Accepted MIME types: images and PDFs (receipts, invoices, etc.). */
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

let bucketPromise: Promise<GridFSBucket> | undefined;

async function createBucket(): Promise<GridFSBucket> {
  const client = await clientPromise;
  return new GridFSBucket(client.db(), { bucketName: BUCKET_NAME });
}

/**
 * Returns a lazily initialized GridFSBucket attached to the shared MongoDB
 * client. The bucket is cached for the lifetime of the process.
 */
export function getGridFSBucket(): Promise<GridFSBucket> {
  if (!bucketPromise) {
    bucketPromise = createBucket();
  }
  return bucketPromise;
}

export interface UploadInput {
  userId: string;
  filename: string;
  contentType: string;
  buffer: Buffer;
}

export interface UploadResult {
  id: ObjectId;
  /** Relative URL served by our own /api/files/[id] route. */
  url: string;
  filename: string;
  contentType: string;
  length: number;
}

/** Stores a single attachment in GridFS and returns its metadata + URL. */
export async function saveUpload({
  userId,
  filename,
  contentType,
  buffer,
}: UploadInput): Promise<UploadResult> {
  const bucket = await getGridFSBucket();
  const id = new ObjectId();

  const uploadStream = bucket.openUploadStreamWithId(id, filename, {
    contentType,
    metadata: { userId },
  });

  await pipeline(Readable.from([buffer]), uploadStream);

  return {
    id,
    url: `/api/files/${id.toString()}`,
    filename,
    contentType,
    length: buffer.length,
  };
}

export interface StoredFileInfo {
  id: ObjectId;
  filename: string;
  contentType?: string;
  length: number;
  userId?: string;
}

/** Returns info about a stored file, or null if it does not exist. */
export async function getStoredFileInfo(id: ObjectId): Promise<StoredFileInfo | null> {
  const bucket = await getGridFSBucket();
  const files = await bucket.find({ _id: id }).limit(1).toArray();

  if (files.length === 0) {
    return null;
  }

  const file = files[0];
  return {
    id: file._id,
    filename: file.filename,
    contentType: file.contentType,
    length: file.length,
    userId: (file.metadata as { userId?: string } | undefined)?.userId,
  };
}

/** Deletes a stored file from GridFS. Throws if the file does not exist. */
export async function deleteStoredFile(id: ObjectId): Promise<void> {
  const bucket = await getGridFSBucket();
  await bucket.delete(id);
}

/** Returns a readable stream for a stored file's contents. */
export async function openDownloadStream(id: ObjectId) {
  const bucket = await getGridFSBucket();
  return bucket.openDownloadStream(id);
}

export function isAllowedMimeType(type: string): type is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(type);
}