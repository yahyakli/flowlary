import { z } from 'zod';
import { ExpenseCategory } from '../db/types/Expense';

export const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.number().positive('Amount must be positive'),
  category: z.nativeEnum(ExpenseCategory),
  type: z.enum(['fixed', 'variable']),
  isRecurring: z.boolean(),
  dueDay: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(1).max(31).optional()
  ),
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
  tags: z.array(z.string()),
  note: z.string().optional(),
});

export type ExpenseSchema = z.infer<typeof expenseSchema>;
