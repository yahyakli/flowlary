import { z } from 'zod';

export const goalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  targetAmount: z.number().positive('Target amount must be positive'),
  savedAmount: z.number().min(0, 'Saved amount cannot be negative'),
  monthlyContribution: z.number().positive('Monthly contribution must be positive'),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().min(1, 'Color is required'),
  deadline: z.date().or(z.string()).pipe(z.coerce.date()).optional(),
});

export type GoalSchema = z.infer<typeof goalSchema>;
