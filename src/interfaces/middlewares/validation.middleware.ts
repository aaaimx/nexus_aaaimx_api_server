import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

interface ValidationOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validateRequest = (schemas: ValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      // Validate query - don't modify req.query, just validate it
      if (schemas.query) {
        schemas.query.parse(req.query);
      }

      // Validate params - don't modify req.params, just validate it
      if (schemas.params) {
        schemas.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues
          .map((err: any) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");

        const response = {
          success: false,
          message: `Validation error: ${errorMessage}`,
          data: null,
          statusCode: 400,
        };

        res.status(400).json(response);
        return;
      }

      next(error);
    }
  };
};
