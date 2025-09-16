import { z } from "zod";

export const ListProjectsSchema = z.object({
  query: z.object({
    status: z
      .enum(["DRAFT", "PUBLISHED", "ARCHIVED", "ONLINE"], {
        message: "Status must be DRAFT, PUBLISHED, ARCHIVED, or ONLINE",
      })
      .optional(),
    isPublic: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    clubId: z.string().uuid("Invalid club ID format").optional(),
    divisionId: z.string().uuid("Invalid division ID format").optional(),
    tagId: z.string().uuid("Invalid tag ID format").optional(),
    search: z
      .string()
      .max(100, "Search term must be less than 100 characters")
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, "Limit must be a number")
      .transform(Number)
      .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100")
      .optional()
      .default(20),
    offset: z
      .string()
      .regex(/^\d+$/, "Offset must be a number")
      .transform(Number)
      .refine((val) => val >= 0, "Offset must be 0 or greater")
      .optional()
      .default(0),
  }),
});

export type ListProjectsQuery = z.infer<typeof ListProjectsSchema>["query"];
