import { z } from "zod";

export const EventParamsSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
});

export type EventParamsSchemaType = z.infer<typeof EventParamsSchema>;
