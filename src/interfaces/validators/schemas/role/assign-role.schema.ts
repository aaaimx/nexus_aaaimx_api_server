import { z } from "zod";

export const AssignRoleSchema = z.object({
  targetUserId: z
    .string()
    .uuid("targetUserId must be a valid UUID")
    .min(1, "targetUserId is required"),
  newRoleId: z
    .string()
    .uuid("newRoleId must be a valid UUID")
    .min(1, "newRoleId is required"),
});

export type AssignRoleInput = z.infer<typeof AssignRoleSchema>;
