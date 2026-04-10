import mongoose from 'mongoose';

declare global {
  var mongoosePromise: Promise<typeof mongoose> | undefined;
}

const uri = process.env.MONGODB_URI;
let cached = globalThis.mongoosePromise;

export default async function connectDB(): Promise<typeof mongoose> {
  if (cached) {
    return cached;
  }

  if (!uri) {
    throw new Error(
      'Missing MONGODB_URI environment variable. Add it to .env.local and restart the app.'
    );
  }

  const promise = mongoose.connect(uri, {
    bufferCommands: false,
  });

  globalThis.mongoosePromise = promise;
  cached = promise;

  return promise;
}
