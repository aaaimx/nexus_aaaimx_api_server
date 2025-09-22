import { z } from "zod";

export const CreateDivisionSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Division name is required")
      .max(100, "Division name must be less than 100 characters")
      .trim(),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
    logoUrl: z.string().url("Logo URL must be a valid URL").optional(),
  }),
});

export type CreateDivisionRequest = z.infer<
  typeof CreateDivisionSchema
>["body"];
