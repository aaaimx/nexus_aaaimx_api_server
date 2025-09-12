/**
 * Role-related constants and enums
 */

export const ROLE_NAMES = {
  PRESIDENT: "president",
  COMMITTEE: "committee",
  LEADER: "leader",
  CO_LEADER: "co-leader",
  MEMBER: "member",
  SENIOR_MEMBER: "senior member",
} as const;

export const ROLE_HIERARCHY = {
  [ROLE_NAMES.PRESIDENT]: 1,
  [ROLE_NAMES.COMMITTEE]: 2,
  [ROLE_NAMES.LEADER]: 3,
  [ROLE_NAMES.CO_LEADER]: 3,
  [ROLE_NAMES.MEMBER]: 4,
  [ROLE_NAMES.SENIOR_MEMBER]: 4,
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

// Role permission rules
export const ROLE_PERMISSIONS = {
  [ROLE_NAMES.PRESIDENT]: {
    canEditRoles: [
      ROLE_NAMES.PRESIDENT,
      ROLE_NAMES.COMMITTEE,
      ROLE_NAMES.LEADER,
      ROLE_NAMES.CO_LEADER,
      ROLE_NAMES.MEMBER,
      ROLE_NAMES.SENIOR_MEMBER,
    ],
    scope: "all",
  },
  [ROLE_NAMES.COMMITTEE]: {
    canEditRoles: [
      ROLE_NAMES.COMMITTEE,
      ROLE_NAMES.LEADER,
      ROLE_NAMES.CO_LEADER,
      ROLE_NAMES.MEMBER,
      ROLE_NAMES.SENIOR_MEMBER,
    ],
    scope: "all",
  },
  [ROLE_NAMES.LEADER]: {
    canEditRoles: [
      ROLE_NAMES.LEADER,
      ROLE_NAMES.CO_LEADER,
      ROLE_NAMES.MEMBER,
      ROLE_NAMES.SENIOR_MEMBER,
    ],
    scope: "same_division_club",
  },
  [ROLE_NAMES.CO_LEADER]: {
    canEditRoles: [
      ROLE_NAMES.LEADER,
      ROLE_NAMES.CO_LEADER,
      ROLE_NAMES.MEMBER,
      ROLE_NAMES.SENIOR_MEMBER,
    ],
    scope: "same_division_club",
  },
  [ROLE_NAMES.MEMBER]: {
    canEditRoles: [],
    scope: "none",
  },
  [ROLE_NAMES.SENIOR_MEMBER]: {
    canEditRoles: [],
    scope: "none",
  },
} as const;

// Default values
export const ROLE_DEFAULTS = {
  DEFAULT_ROLE: ROLE_NAMES.MEMBER,
} as const;
