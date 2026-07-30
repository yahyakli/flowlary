import { z } from 'zod';

export const recurringRuleSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().min(1).optional(),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  frequency: z.enum(['monthly', 'weekly']),
  nextRunDate: z.coerce.date(),
  active: z.boolean().optional(),
});

export const recurringRuleUpdateSchema = recurringRuleSchema.partial();

export type RecurringRuleSchema = z.infer<typeof recurringRuleSchema>;
export type RecurringRuleUpdateSchema = z.infer<typeof recurringRuleUpdateSchema>;