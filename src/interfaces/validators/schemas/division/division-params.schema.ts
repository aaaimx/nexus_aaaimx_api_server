import { z } from "zod";

export const DivisionParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid division ID format"),
  }),
});

export type DivisionParams = z.infer<typeof DivisionParamsSchema>["params"];
