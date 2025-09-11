/**
 * User-related constants and enums
 */

export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;

export const VERIFICATION_STATUS = {
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  EXPIRED: "EXPIRED",
} as const;

export const NOTIFICATION_PREFERENCES = {
  ENABLED: true,
  DISABLED: false,
} as const;

// Type definitions for better type safety
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];
export type VerificationStatus =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

// Default values
export const USER_DEFAULTS = {
  IS_ACTIVE: true,
  IS_EMAIL_VERIFIED: false,
  ALLOW_NOTIFICATIONS: true,
} as const;
