import { z } from "zod";

export const AddProjectMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid project ID format"),
  }),
  body: z.object({
    memberId: z.string().uuid("Invalid member ID format"),
  }),
});

export const RemoveProjectMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid project ID format"),
    memberId: z.string().uuid("Invalid member ID format"),
  }),
});

export const GetProjectMembersSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid project ID format"),
  }),
});

export type AddProjectMemberRequest = z.infer<
  typeof AddProjectMemberSchema
>["body"];
export type AddProjectMemberParams = z.infer<
  typeof AddProjectMemberSchema
>["params"];
export type RemoveProjectMemberParams = z.infer<
  typeof RemoveProjectMemberSchema
>["params"];
export type GetProjectMembersParams = z.infer<
  typeof GetProjectMembersSchema
>["params"];
