import { z } from 'zod';

export const goalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  targetAmount: z.number().positive('Target amount must be positive'),
  savedAmount: z.number().min(0, 'Saved amount cannot be negative').default(0),
  deadline: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  monthlyContribution: z.number().positive('Monthly contribution must be positive'),
  icon: z.string().default('target'),
  color: z.string().default('#4f46e5'),
});

export type GoalSchema = z.infer<typeof goalSchema>;
