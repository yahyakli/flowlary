import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters").max(50, "Password must be less than 50 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;
