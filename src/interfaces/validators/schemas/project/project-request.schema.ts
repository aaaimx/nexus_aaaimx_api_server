import { z } from "zod";

// Schema para crear una solicitud de proyecto
export const CreateProjectRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid("Project ID must be a valid UUID"),
  }),
  body: z.object({
    message: z
      .string()
      .min(1, "Message cannot be empty")
      .max(500, "Message cannot exceed 500 characters")
      .optional(),
  }),
});

// Schema para listar solicitudes de proyecto
export const ListProjectRequestsSchema = z.object({
  params: z.object({
    id: z.string().uuid("Project ID must be a valid UUID"),
  }),
  query: z.object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  }),
});

// Schema para procesar una solicitud de proyecto
export const ProcessProjectRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid("Project ID must be a valid UUID"),
    requestId: z.string().uuid("Request ID must be a valid UUID"),
  }),
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"], {
      message: "Status must be either 'APPROVED' or 'REJECTED'",
    }),
    adminMessage: z
      .string()
      .min(1, "Admin message cannot be empty")
      .max(500, "Admin message cannot exceed 500 characters")
      .optional(),
  }),
});

// Schema para cancelar una solicitud de proyecto
export const CancelProjectRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid("Project ID must be a valid UUID"),
    requestId: z.string().uuid("Request ID must be a valid UUID"),
  }),
});

// Tipos TypeScript inferidos de los schemas
export type CreateProjectRequestRequest = z.infer<
  typeof CreateProjectRequestSchema
>["body"];
export type ListProjectRequestsRequest = z.infer<
  typeof ListProjectRequestsSchema
>["query"];
export type ProcessProjectRequestRequest = z.infer<
  typeof ProcessProjectRequestSchema
>["body"];
export type ProjectRequestParams = z.infer<
  typeof ProcessProjectRequestSchema
>["params"];
