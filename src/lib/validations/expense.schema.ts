import { z } from 'zod';
import { ExpenseCategory } from '../db/types/Expense';

export const expenseSchema = z.object({
  date: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) {
        return undefined;
      }

      if (val instanceof Date) {
        return val;
      }

      if (typeof val === 'string') {
        // Parse YYYY-MM-DD as local time to avoid timezone shifts
        const parts = val.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
          const day = parseInt(parts[2], 10);
          return new Date(year, month, day);
        }
      }

      return val;
    },
    z.date().optional()
  ),
  category: z.nativeEnum(ExpenseCategory),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  notes: z.string().optional(),
  attachmentUrl: z
    .string()
    .min(1, 'Attachment URL cannot be empty')
    .refine(
      (val) => {
        // Accept internal relative paths (e.g. /api/files/<id>) or absolute URLs.
        if (val.startsWith('/')) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Attachment URL must be a valid URL or /api/ path' }
    )
    .optional(),
});

export type ExpenseSchema = z.infer<typeof expenseSchema>;
