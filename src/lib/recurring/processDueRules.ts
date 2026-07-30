import { addWeeks, addMonths } from 'date-fns';
import connectDB from '../db/mongoose';
import { RecurringRule, type IRecurringRule } from '../db/models/RecurringRule';
import { PendingDraft } from '../db/models/PendingDraft';

export interface ProcessDueRulesResult {
  processed: number;
  draftsCreated: number;
  skipped: number;
  errors: number;
}

function advanceNextRunDate(rule: IRecurringRule): Date {
  if (rule.frequency === 'weekly') {
    return addWeeks(rule.nextRunDate, 1);
  }
  return addMonths(rule.nextRunDate, 1);
}

interface MongoServerErrorLike extends Error {
  code?: number;
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'MongoServerError' || error.name === 'BulkWriteError') &&
    (error as MongoServerErrorLike).code === 11000
  );
}

/**
 * Finds all active RecurringRules whose nextRunDate is due and creates a pending
 * PendingDraft for each. The draft must be confirmed by the user in the UI before
 * it posts to the ledger — this function never auto-posts.
 *
 * After creating (or finding an existing) draft, the rule's nextRunDate is advanced
 * by one frequency interval so the same rule is not processed again on the next run.
 */
export async function processDueRules(now: Date = new Date()): Promise<ProcessDueRulesResult> {
  await connectDB();

  const dueRules = await RecurringRule.find({
    active: true,
    nextRunDate: { $lte: now },
  }).lean();

  let draftsCreated = 0;
  let skipped = 0;
  let errors = 0;

  for (const rule of dueRules) {
    try {
      // Idempotency: skip if a draft already exists for this rule + scheduled date.
      const existing = await PendingDraft.findOne({
        ruleId: rule._id,
        scheduledDate: rule.nextRunDate,
      }).lean();

      if (existing) {
        skipped++;
      } else {
        await PendingDraft.create({
          userId: rule.userId,
          ruleId: rule._id,
          type: rule.type,
          category: rule.category,
          amount: rule.amount,
          description: rule.description,
          scheduledDate: rule.nextRunDate,
          status: 'pending',
        });
        draftsCreated++;
      }

      // Advance nextRunDate regardless of whether the draft was just created or already existed.
      const nextDate = advanceNextRunDate(rule);
      await RecurringRule.updateOne({ _id: rule._id }, { $set: { nextRunDate: nextDate } });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        // A concurrent run created the draft first; still advance the nextRunDate.
        const nextDate = advanceNextRunDate(rule);
        await RecurringRule.updateOne({ _id: rule._id }, { $set: { nextRunDate: nextDate } });
        skipped++;
        continue;
      }
      errors++;
    }
  }

  return {
    processed: dueRules.length,
    draftsCreated,
    skipped,
    errors,
  };
}