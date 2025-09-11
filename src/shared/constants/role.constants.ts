/**
 * Role-related constants and enums
 */

export const ROLE_NAMES = {
  ADMIN: "admin",
  MEMBER: "member",
  MODERATOR: "moderator",
  ORGANIZER: "organizer",
} as const;

export const REQUEST_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

// Type definitions for better type safety
export type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];
export type RequestStatus =
  (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];

// Default values
export const ROLE_DEFAULTS = {
  DEFAULT_ROLE: ROLE_NAMES.MEMBER,
} as const;
