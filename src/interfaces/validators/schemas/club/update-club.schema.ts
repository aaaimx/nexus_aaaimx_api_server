import { z } from "zod";

export const UpdateClubSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid club ID format"),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, "Club name is required")
      .max(100, "Club name must be less than 100 characters")
      .trim()
      .optional(),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
    logoUrl: z.string().url("Logo URL must be a valid URL").optional(),
  }),
});

export type UpdateClubRequest = z.infer<typeof UpdateClubSchema>["body"];
export type UpdateClubParams = z.infer<typeof UpdateClubSchema>["params"];
