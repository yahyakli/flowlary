import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@/lib/recurring/processDueRules', () => ({
  processDueRules: vi.fn(),
}));

const { processDueRules } = await import('@/lib/recurring/processDueRules');
const { GET: cronHandler } = await import('./route');

const mockedProcessDueRules = vi.mocked(processDueRules);

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.clearAllMocks();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('Cron recurring route', () => {
  it('returns 401 when authorization header is missing', async () => {
    process.env.CRON_SECRET = 'test-secret';
    const request = new Request('https://example.com/api/cron/recurring');
    const response = await cronHandler(request);
    expect(response.status).toBe(401);
  });

  it('returns 401 when authorization header does not match CRON_SECRET', async () => {
    process.env.CRON_SECRET = 'test-secret';
    const request = new Request('https://example.com/api/cron/recurring', {
      headers: { authorization: 'Bearer wrong-secret' },
    });
    const response = await cronHandler(request);
    expect(response.status).toBe(401);
    expect(mockedProcessDueRules).not.toHaveBeenCalled();
  });

  it('returns 500 when CRON_SECRET is not configured', async () => {
    delete process.env.CRON_SECRET;
    const request = new Request('https://example.com/api/cron/recurring');
    const response = await cronHandler(request);
    expect(response.status).toBe(500);
  });

  it('processes due rules when authorized', async () => {
    process.env.CRON_SECRET = 'test-secret';
    mockedProcessDueRules.mockResolvedValueOnce({
      processed: 3,
      draftsCreated: 2,
      skipped: 1,
      errors: 0,
    });

    const request = new Request('https://example.com/api/cron/recurring', {
      headers: { authorization: 'Bearer test-secret' },
    });
    const response = await cronHandler(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      processed: 3,
      draftsCreated: 2,
      skipped: 1,
      errors: 0,
    });
    expect(mockedProcessDueRules).toHaveBeenCalled();
  });
});