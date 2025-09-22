import { z } from "zod";

export const CreateClubSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Club name is required")
      .max(100, "Club name must be less than 100 characters")
      .trim(),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
    logoUrl: z.string().url("Logo URL must be a valid URL").optional(),
  }),
});

export type CreateClubRequest = z.infer<typeof CreateClubSchema>["body"];
