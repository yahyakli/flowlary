import { z } from 'zod';
import { ExpenseCategory } from '../db/types/Expense';

export const expenseSchema = z.object({
  date: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : new Date(val)),
    z.date()
  ),
  category: z.nativeEnum(ExpenseCategory),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  notes: z.string().optional(),
});

export type ExpenseSchema = z.infer<typeof expenseSchema>;
