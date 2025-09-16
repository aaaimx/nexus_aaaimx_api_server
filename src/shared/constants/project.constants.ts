// Content status constants (unified for projects and events)
export const CONTENT_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
  ONLINE: "ONLINE",
} as const;

// Project validation constants
export const PROJECT_VALIDATION = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  MAX_TAGS: 10,
  MAX_CLUBS: 5,
  MAX_DIVISIONS: 5,
} as const;

// Project pagination constants
export const PROJECT_PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
} as const;

// Project error messages
export const PROJECT_ERRORS = {
  NOT_FOUND: "Project not found",
  ALREADY_EXISTS: "Project with this name already exists",
  INSUFFICIENT_PERMISSIONS: "Insufficient permissions to perform this action",
  CANNOT_VIEW: "Insufficient permissions to view this project",
  CANNOT_EDIT: "Insufficient permissions to edit this project",
  CANNOT_DELETE: "Insufficient permissions to delete this project",
  CANNOT_MANAGE_MEMBERS: "Insufficient permissions to manage project members",
  MEMBER_ALREADY_EXISTS: "User is already a member of this project",
  MEMBER_NOT_FOUND: "User is not a member of this project",
  INVALID_STATUS: "Invalid project status",
} as const;

// Type exports
export type ContentStatus =
  (typeof CONTENT_STATUS)[keyof typeof CONTENT_STATUS];
