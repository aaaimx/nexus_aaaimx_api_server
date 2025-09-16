import { z } from "zod";

export const ProjectParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid project ID format"),
  }),
});

export type ProjectParams = z.infer<typeof ProjectParamsSchema>["params"];
