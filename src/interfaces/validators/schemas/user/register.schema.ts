import { z } from "zod";

export const RegisterSchema = z.object({
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be at most 50 characters"),
  last_name: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be at most 50 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  birth_date: z.string().datetime("Birth date must be a valid ISO 8601 date"),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  photo_url: z.string().url("Photo URL must be a valid URL").optional(),
});

export type RegisterSchemaType = z.infer<typeof RegisterSchema>;
