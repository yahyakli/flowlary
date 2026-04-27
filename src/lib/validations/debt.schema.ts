import { z } from 'zod';

export const debtSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  totalAmount: z.number().positive('Total amount must be positive'),
  remainingAmount: z.number().min(0, 'Remaining amount cannot be negative'),
  monthlyPayment: z.number().positive('Monthly payment must be positive'),
  interestRate: z.number().min(0, 'Interest rate cannot be negative'),
  dueDay: z.number().min(1).max(31).optional(),
  lender: z.string().min(1, 'Lender is required'),
});

export type DebtSchema = z.infer<typeof debtSchema>;
