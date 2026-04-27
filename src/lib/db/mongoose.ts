import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

declare global {
  var mongoosePromise: Promise<typeof mongoose> | undefined;
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI!;

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export { clientPromise };

let cached = globalThis.mongoosePromise;

export default async function connectDB(): Promise<typeof mongoose> {
  if (cached) {
    return cached;
  }

  // Check for common connection string issues
  if (uri.includes('@') && uri.lastIndexOf('@') !== uri.indexOf('@', uri.indexOf('//') + 2)) {
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
    globalThis.mongoosePromise = undefined;
    cached = undefined;
    throw error;
  }
}
