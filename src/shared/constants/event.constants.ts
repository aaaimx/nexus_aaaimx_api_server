/**
 * Event-related constants and enums
 */

export const EVENT_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
  ONLINE: "ONLINE",
} as const;

export const EVENT_TYPE = {
  SINGLE: "SINGLE",
  COURSE: "COURSE",
  WORKSHOP: "WORKSHOP",
  RECURRING: "RECURRING",
} as const;

export const RECURRENCE_PATTERN = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  CUSTOM: "CUSTOM",
} as const;

export const ORGANIZER_TYPE = {
  USER: "USER",
  DIVISION: "DIVISION",
  CLUB: "CLUB",
  EXTERNAL: "EXTERNAL",
} as const;

export const ATTENDEE_STATUS = {
  REGISTERED: "REGISTERED",
  CANCELLED: "CANCELLED",
} as const;

// Type definitions for better type safety
export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];
export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];
export type RecurrencePattern =
  (typeof RECURRENCE_PATTERN)[keyof typeof RECURRENCE_PATTERN];
export type OrganizerType =
  (typeof ORGANIZER_TYPE)[keyof typeof ORGANIZER_TYPE];
export type AttendeeStatus =
  (typeof ATTENDEE_STATUS)[keyof typeof ATTENDEE_STATUS];

// Default values
export const EVENT_DEFAULTS = {
  STATUS: EVENT_STATUS.DRAFT,
  TYPE: EVENT_TYPE.SINGLE,
  IS_PUBLIC: true,
  IS_RECURRING: false,
} as const;
