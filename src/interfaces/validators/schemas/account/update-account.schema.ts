import { z } from "zod";

export const UpdateAccountSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name must be at most 50 characters")
      .optional(),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name must be at most 50 characters")
      .optional(),
    bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  })
  .refine(
    (data) => {
      return Object.keys(data).length > 0;
    },
    {
      message: "At least one field must be provided for update",
    }
  );

export type UpdateAccountSchemaType = z.infer<typeof UpdateAccountSchema>;
