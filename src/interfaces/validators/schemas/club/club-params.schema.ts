import { z } from "zod";

export const ClubParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid club ID format"),
  }),
});

export type ClubParams = z.infer<typeof ClubParamsSchema>["params"];
