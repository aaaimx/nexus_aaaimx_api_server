import { z } from "zod";

export const CreateProjectSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Project name is required")
      .max(100, "Project name must be less than 100 characters")
      .trim(),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
    coverUrl: z.string().url("Cover URL must be a valid URL").optional(),
    isPublic: z.boolean().default(true),
    tagIds: z
      .array(z.string().uuid("Invalid tag ID format"))
      .optional()
      .default([]),
    clubIds: z
      .array(z.string().uuid("Invalid club ID format"))
      .optional()
      .default([]),
    divisionIds: z
      .array(z.string().uuid("Invalid division ID format"))
      .optional()
      .default([]),
  }),
});

export type CreateProjectRequest = z.infer<typeof CreateProjectSchema>["body"];
