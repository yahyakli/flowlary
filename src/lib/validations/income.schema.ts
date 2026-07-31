import { z } from "zod";

export const incomeSchema = z.object({
  source: z.string().min(1, "Source is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  date: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) {
        return undefined;
      }
      if (val instanceof Date) {
        return val;
      }
      if (typeof val === 'string') {
        // Parse YYYY-MM-DD as local time to avoid timezone shifts
        const parts = val.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
          const day = parseInt(parts[2], 10);
          return new Date(year, month, day);
        }
      }
      return val;
    },
    z.date().optional()
  ),
  notes: z.string().optional(),
});

export type IncomeSchema = z.infer<typeof incomeSchema>;
