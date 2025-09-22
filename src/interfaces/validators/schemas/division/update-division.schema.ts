import { z } from "zod";

export const UpdateDivisionSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid division ID format"),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, "Division name is required")
      .max(100, "Division name must be less than 100 characters")
      .trim()
      .optional(),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
    logoUrl: z.string().url("Logo URL must be a valid URL").optional(),
  }),
});

export type UpdateDivisionRequest = z.infer<
  typeof UpdateDivisionSchema
>["body"];
export type UpdateDivisionParams = z.infer<
  typeof UpdateDivisionSchema
>["params"];
