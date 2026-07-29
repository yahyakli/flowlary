import { z } from "zod";

export const incomeSchema = z.object({
  source: z.string().min(1, "Source is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  date: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export type IncomeSchema = z.infer<typeof incomeSchema>;
