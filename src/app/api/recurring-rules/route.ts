import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import { RecurringRule } from '@/lib/db/models/RecurringRule';
import { recurringRuleSchema } from '@/lib/validations/recurring-rule.schema';
import { ZodError } from 'zod';

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function validationErrorResponse(details: unknown) {
  return NextResponse.json({ error: 'Validation failed', details }, { status: 400 });
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
    const rules = await RecurringRule.find({ userId: session.user.id })
      .sort({ nextRunDate: 1 })
      .lean();

    return NextResponse.json({ rules });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validatedData = recurringRuleSchema.parse(body);

    await connectDB();

    const rule = await RecurringRule.create({
      ...validatedData,
      userId: session.user.id,
      active: validatedData.active ?? true,
    });

    return NextResponse.json({ rule }, { status: 201 });
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