import { z } from 'zod';
import { ExpenseCategory } from '../db/types/Expense';

export const budgetSchema = z.object({
  category: z.nativeEnum(ExpenseCategory),
  monthlyLimit: z.number().positive('Monthly limit must be positive'),
});

export type BudgetSchema = z.infer<typeof budgetSchema>;