import { z } from "zod";
import {
  EVENT_STATUS,
  EVENT_TYPE,
  ORGANIZER_TYPE,
  RECURRENCE_PATTERN,
} from "@/shared/constants";

export const UpdateEventSchema = z
  .object({
    name: z
      .string()
      .min(1, "Event name is required")
      .max(255, "Event name too long")
      .optional(),
    description: z.string().optional(),
    status: z
      .enum(Object.values(EVENT_STATUS) as [string, ...string[]])
      .optional(),
    eventType: z
      .enum(Object.values(EVENT_TYPE) as [string, ...string[]])
      .optional(),
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
    startTime: z
      .string()
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
      .optional(),
    endTime: z
      .string()
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
      .optional(),
    sessionDurationMinutes: z.number().int().min(1).optional(),
    coverUrl: z.string().url("Invalid cover URL").optional(),
    location: z.string().max(500, "Location too long").optional(),
    isPublic: z.boolean().optional(),
    maxParticipants: z.number().int().min(1).optional(),
    organizerType: z
      .enum(Object.values(ORGANIZER_TYPE) as [string, ...string[]])
      .optional(),
    organizerUserId: z.string().uuid("Invalid user ID").optional(),
    organizerDivisionId: z.string().uuid("Invalid division ID").optional(),
    organizerClubId: z.string().uuid("Invalid club ID").optional(),
    externalOrganizerName: z
      .string()
      .min(1, "External organizer name is required")
      .max(255, "External organizer name too long")
      .optional(),
    isRecurring: z.boolean().optional(),
    recurrencePattern: z
      .enum(Object.values(RECURRENCE_PATTERN) as [string, ...string[]])
      .optional(),
    recurrenceInterval: z.number().int().min(1).optional(),
    recurrenceStartDate: z
      .string()
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    recurrenceEndDate: z
      .string()
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    recurrenceDays: z.string().optional(),
  })
  .refine(
    (data) => {
      // Validate organizer fields based on organizer type (only if organizerType is provided)
      if (data.organizerType === ORGANIZER_TYPE.USER && !data.organizerUserId) {
        return false;
      }
      if (
        data.organizerType === ORGANIZER_TYPE.DIVISION &&
        !data.organizerDivisionId
      ) {
        return false;
      }
      if (data.organizerType === ORGANIZER_TYPE.CLUB && !data.organizerClubId) {
        return false;
      }
      if (
        data.organizerType === ORGANIZER_TYPE.EXTERNAL &&
        !data.externalOrganizerName
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Organizer ID or name is required based on organizer type",
      path: ["organizerType"],
    }
  )
  .refine(
    (data) => {
      // Validate dates (only if both are provided)
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
      // Validate times (only if both are provided)
      if (data.startTime && data.endTime && data.startTime >= data.endTime) {
        return false;
      }
      return true;
    },
    {
      message: "Start time must be before end time",
      path: ["endTime"],
    }
  );

export type UpdateEventSchemaType = z.infer<typeof UpdateEventSchema>;
