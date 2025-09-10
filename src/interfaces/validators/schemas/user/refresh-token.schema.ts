import { z } from "zod";

export const RefreshTokenSchema = z.object({
  refresh_token: z.string().min(1, "Refresh token is required"),
});

export type RefreshTokenSchemaType = z.infer<typeof RefreshTokenSchema>;
