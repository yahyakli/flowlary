import { NextResponse } from 'next/server';
import { processDueRules } from '@/lib/recurring/processDueRules';

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function serverErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Internal Server Error';
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Cron endpoint that processes due RecurringRules and creates pending drafts.
 *
 * This route is intended to be triggered by an external scheduler (e.g. Vercel Cron).
 * It is protected by a shared secret passed in the `authorization` header, which must
 * match the CRON_SECRET environment variable.
 *
 * The route never auto-posts to the ledger — it only creates pending drafts that the
 * user must confirm in the UI.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET is not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return unauthorizedResponse();
    }

    const result = await processDueRules();

    return NextResponse.json(result);
  } catch (error) {
    return serverErrorResponse(error);
  }
}