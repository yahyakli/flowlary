import { z } from "zod";

export const salarySchema = z.object({
  amount: z.number().min(0, "Salary must be a positive number"),
  frequency: z.enum(["monthly", "biweekly", "weekly"]),
  payDay: z.number().min(1).max(31),
  initialBalance: z.number().min(0),
});

export type SalarySchema = z.infer<typeof salarySchema>;
