import { z } from "zod";

export const ResetPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
  reset_password_code: z
    .string()
    .min(6, "Reset code must be at least 6 characters"),
  new_password: z.string().min(8, "Password must be at least 8 characters"),
});

export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;
