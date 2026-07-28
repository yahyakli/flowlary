import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('connectDB', () => {
  const globalCache = globalThis as typeof globalThis & {
    mongoosePromise?: unknown;
    _mongoClientPromise?: unknown;
  };

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('MONGODB_URI', 'mongodb://example.test:27017/flowlary');
    vi.stubEnv('NODE_ENV', 'test');
    delete globalCache.mongoosePromise;
    delete globalCache._mongoClientPromise;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.doUnmock('mongoose');
    vi.doUnmock('mongodb');
  });

  it('connects once and reuses the cached Mongoose connection', async () => {
    const connectedMongoose = {} as typeof import('mongoose').default;
    const mongooseConnect = vi.fn().mockResolvedValue(connectedMongoose);
    const mongoClientConnect = vi.fn().mockResolvedValue({});
    const MongoClient = vi.fn(function MongoClient() {
      return { connect: mongoClientConnect };
    });

    vi.doMock('mongoose', () => ({ default: { connect: mongooseConnect } }));
    vi.doMock('mongodb', () => ({ MongoClient }));

    const { clientPromise, default: connectDB } = await import('./mongoose');

    await expect(clientPromise).resolves.toEqual({});
    await expect(connectDB()).resolves.toBe(connectedMongoose);
    await expect(connectDB()).resolves.toBe(connectedMongoose);

    expect(MongoClient).toHaveBeenCalledWith('mongodb://example.test:27017/flowlary');
    expect(mongoClientConnect).toHaveBeenCalledTimes(1);
    expect(mongooseConnect).toHaveBeenCalledTimes(1);
    expect(mongooseConnect).toHaveBeenCalledWith('mongodb://example.test:27017/flowlary', {
      bufferCommands: false,
    });
  });
});
