import { z } from 'zod';

export const goalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  targetAmount: z.number().positive('Target amount must be positive'),
  currentSaved: z.number().min(0, 'Current saved amount cannot be negative'),
  deadline: z.date().or(z.string()).pipe(z.coerce.date()),
  icon: z.string().optional(),
  color: z.string().optional(),
  monthlyContribution: z.number().min(0, 'Monthly contribution cannot be negative').optional(),
});

export type GoalSchema = z.infer<typeof goalSchema>;