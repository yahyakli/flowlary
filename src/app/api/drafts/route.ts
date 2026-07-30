import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import { PendingDraft } from '@/lib/db/models/PendingDraft';

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function serverErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Internal Server Error';
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    await connectDB();
    const drafts = await PendingDraft.find({
      userId: session.user.id,
      status: 'pending',
    })
      .sort({ scheduledDate: 1 })
      .lean();

    return NextResponse.json({ drafts });
  } catch (error) {
    return serverErrorResponse(error);
  }
}