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

      if (typeof val === 'string' || typeof val === 'number') {
        return new Date(val);
      }

      return val;
    },
    z.date().optional()
  ),
  category: z.nativeEnum(ExpenseCategory),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  notes: z.string().optional(),
});

export type ExpenseSchema = z.infer<typeof expenseSchema>;
