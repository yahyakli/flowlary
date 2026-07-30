import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import { RecurringRule } from '@/lib/db/models/RecurringRule';
import { recurringRuleUpdateSchema } from '@/lib/validations/recurring-rule.schema';
import { ZodError } from 'zod';

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function validationErrorResponse(details: unknown) {
  return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
}

function notFoundResponse() {
  return NextResponse.json({ error: 'Recurring rule not found' }, { status: 404 });
}

function serverErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Internal Server Error';
  return NextResponse.json({ error: message }, { status: 500 });
}

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

    await connectDB();
    const rule = await RecurringRule.findOne({ _id: id, userId: session.user.id }).lean();

    if (!rule) {
      return notFoundResponse();
    }

    return NextResponse.json({ rule });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

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
    const validatedData = recurringRuleUpdateSchema.parse(body);

    await connectDB();

    const rule = await RecurringRule.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: validatedData },
      { new: true }
    ).lean();

    if (!rule) {
      return notFoundResponse();
    }

    return NextResponse.json({ rule });
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

export async function DELETE(
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

    await connectDB();

    const rule = await RecurringRule.findOneAndDelete({ _id: id, userId: session.user.id });
    if (!rule) {
      return notFoundResponse();
    }

    return NextResponse.json({ message: 'Recurring rule deleted successfully' });
  } catch (error) {
    return serverErrorResponse(error);
  }
}