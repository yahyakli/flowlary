import { z } from "zod";

export const incomeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  date: z.string().or(z.date()).optional(),
});

export type IncomeSchema = z.infer<typeof incomeSchema>;
