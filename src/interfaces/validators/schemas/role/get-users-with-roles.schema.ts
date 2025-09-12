import { z } from "zod";

export const GetUsersWithRolesSchema = z.object({
  skip: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: "skip must be a non-negative number",
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, {
      message: "limit must be a positive number between 1 and 100",
    }),
  divisionId: z.string().uuid("divisionId must be a valid UUID").optional(),
  clubId: z.string().uuid("clubId must be a valid UUID").optional(),
  roleId: z.string().uuid("roleId must be a valid UUID").optional(),
});

export type GetUsersWithRolesInput = z.infer<typeof GetUsersWithRolesSchema>;
