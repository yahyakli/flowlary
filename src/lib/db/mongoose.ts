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

  // Check for common connection string issues
  if (uri.includes('@') && uri.lastIndexOf('@') !== uri.indexOf('@', uri.indexOf('//') + 2)) {
    // This is a rough check to see if there's more than one @, 
    // which usually means one is in the password and not encoded.
    console.warn('Warning: Your MONGODB_URI might contain unencoded special characters in the password.');
  }

  try {
    const promise = mongoose.connect(uri, {
      bufferCommands: false,
    });

    globalThis.mongoosePromise = promise;
    cached = promise;

    return await promise;
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);
    // Don't cache the failed promise
    globalThis.mongoosePromise = undefined;
    cached = undefined;
    throw error;
  }
}
