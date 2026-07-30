import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import { PendingDraft } from '@/lib/db/models/PendingDraft';
import { Income } from '@/lib/db/models/Income';
import { Expense } from '@/lib/db/models/Expense';
import { postLedgerEntry } from '@/lib/ledger/postEntry';

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function validationErrorResponse(details: unknown) {
  return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
}

function notFoundResponse() {
  return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
}

function serverErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Internal Server Error';
  return NextResponse.json({ error: message }, { status: 500 });
}

const draftActionSchema = z.object({
  action: z.enum(['confirm', 'dismiss']),
});

export async function PATCH(
  req: Request,
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

    const body = await req.json();
    const { action } = draftActionSchema.parse(body);

    await connectDB();

    const draft = await PendingDraft.findOne({
      _id: id,
      userId: session.user.id,
      status: 'pending',
    });

    if (!draft) {
      return notFoundResponse();
    }

    if (action === 'dismiss') {
      draft.status = 'dismissed';
      await draft.save();
      return NextResponse.json({ draft });
    }

    // action === 'confirm': post to the ledger and create the domain record.
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const date = draft.scheduledDate;

    if (draft.type === 'income') {
      const income = await Income.create({
        userId: session.user.id,
        source: draft.category ?? draft.description,
        amount: draft.amount,
        date,
        notes: draft.description,
      });

      try {
        await postLedgerEntry(userId, {
          type: 'income',
          amountIn: draft.amount,
          date,
          note: draft.description,
          category: draft.category ?? draft.description,
          sourceRefId: income._id,
        });
      } catch (ledgerError) {
        await Income.deleteOne({ _id: income._id });
        throw ledgerError;
      }
    } else {
      const expense = await Expense.create({
        userId: session.user.id,
        date,
        category: draft.category ?? 'Miscellaneous/Other',
        description: draft.description,
        amount: draft.amount,
        notes: draft.description,
        title: draft.description,
        type: 'variable',
        isRecurring: true,
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        tags: [],
        note: draft.description,
      });

      try {
        await postLedgerEntry(userId, {
          type: 'expense',
          amountOut: draft.amount,
          date,
          category: draft.category ?? 'Miscellaneous/Other',
          note: draft.description,
          sourceRefId: expense._id,
        });
      } catch (ledgerError) {
        await Expense.deleteOne({ _id: expense._id });
        throw ledgerError;
      }
    }

    draft.status = 'confirmed';
    await draft.save();

    return NextResponse.json({ draft });
  } catch (error) {
    if (error instanceof ZodError || (error as { name?: string })?.name === 'ZodError') {
      return validationErrorResponse(
        (error as { issues?: unknown; errors?: unknown }).issues ??
          (error as { errors?: unknown }).errors
      );
    }
    return serverErrorResponse(error);
  }
}