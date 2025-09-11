import { z } from "zod";

export const ListEventsSchema = z
  .object({
    userId: z.string().uuid("Invalid user ID").optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "ONLINE"]).optional(),
    eventType: z.enum(["SINGLE", "COURSE", "WORKSHOP", "RECURRING"]).optional(),
    organizerType: z.enum(["USER", "DIVISION", "CLUB", "EXTERNAL"]).optional(),
    organizerId: z.string().uuid("Invalid organizer ID").optional(),
    isPublic: z.boolean().optional(),
    upcomingOnly: z.boolean().optional(),
    startDate: z
      .string()
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    endDate: z
      .string()
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    page: z.number().int().min(1).optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(10),
  })
  .refine(
    (data) => {
      // Validate date range
      if (data.startDate && data.endDate && data.startDate > data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: "Start date must be before or equal to end date",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      // Validate organizer fields
      if (data.organizerType && !data.organizerId) {
        return false;
      }
      return true;
    },
    {
      message: "Organizer ID is required when organizer type is specified",
      path: ["organizerId"],
    }
  );

export type ListEventsSchemaType = z.infer<typeof ListEventsSchema>;
