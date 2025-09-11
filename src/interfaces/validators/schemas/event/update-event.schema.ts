import { z } from "zod";

export const UpdateEventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(255, "Event name too long").optional(),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "ONLINE"]).optional(),
  eventType: z.enum(["SINGLE", "COURSE", "WORKSHOP", "RECURRING"]).optional(),
  startDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  endDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional(),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional(),
  sessionDurationMinutes: z.number().int().min(1).optional(),
  coverUrl: z.string().url("Invalid cover URL").optional(),
  location: z.string().max(500, "Location too long").optional(),
  isPublic: z.boolean().optional(),
  maxParticipants: z.number().int().min(1).optional(),
  organizerType: z.enum(["USER", "DIVISION", "CLUB", "EXTERNAL"]).optional(),
  organizerUserId: z.string().uuid("Invalid user ID").optional(),
  organizerDivisionId: z.string().uuid("Invalid division ID").optional(),
  organizerClubId: z.string().uuid("Invalid club ID").optional(),
  externalOrganizerName: z.string().min(1, "External organizer name is required").max(255, "External organizer name too long").optional(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: z.enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]).optional(),
  recurrenceInterval: z.number().int().min(1).optional(),
  recurrenceStartDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  recurrenceEndDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  recurrenceDays: z.string().optional(),
}).refine((data) => {
  // Validate organizer fields based on organizer type (only if organizerType is provided)
  if (data.organizerType === "USER" && !data.organizerUserId) {
    return false;
  }
  if (data.organizerType === "DIVISION" && !data.organizerDivisionId) {
    return false;
  }
  if (data.organizerType === "CLUB" && !data.organizerClubId) {
    return false;
  }
  if (data.organizerType === "EXTERNAL" && !data.externalOrganizerName) {
    return false;
  }
  return true;
}, {
  message: "Organizer ID or name is required based on organizer type",
  path: ["organizerType"]
}).refine((data) => {
  // Validate dates (only if both are provided)
  if (data.startDate && data.endDate && data.startDate > data.endDate) {
    return false;
  }
  return true;
}, {
  message: "Start date must be before or equal to end date",
  path: ["endDate"]
}).refine((data) => {
  // Validate times (only if both are provided)
  if (data.startTime && data.endTime && data.startTime >= data.endTime) {
    return false;
  }
  return true;
}, {
  message: "Start time must be before end time",
  path: ["endTime"]
});

export type UpdateEventSchemaType = z.infer<typeof UpdateEventSchema>;
