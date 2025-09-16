import { z } from "zod";

export const UpdateProjectSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid project ID format"),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, "Project name is required")
      .max(100, "Project name must be less than 100 characters")
      .trim()
      .optional(),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
    coverUrl: z.string().url("Cover URL must be a valid URL").optional(),
    status: z
      .enum(["DRAFT", "PUBLISHED", "ARCHIVED", "ONLINE"], {
        message: "Status must be DRAFT, PUBLISHED, ARCHIVED, or ONLINE",
      })
      .optional(),
    isPublic: z.boolean().optional(),
    tagIds: z.array(z.string().uuid("Invalid tag ID format")).optional(),
    clubIds: z.array(z.string().uuid("Invalid club ID format")).optional(),
    divisionIds: z
      .array(z.string().uuid("Invalid division ID format"))
      .optional(),
  }),
});

export type UpdateProjectRequest = z.infer<typeof UpdateProjectSchema>["body"];
export type UpdateProjectParams = z.infer<typeof UpdateProjectSchema>["params"];
