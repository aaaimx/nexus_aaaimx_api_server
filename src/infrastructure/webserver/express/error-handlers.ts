import { env } from "@/infrastructure/config/env.config";
import logger from "@/infrastructure/logger/index";
import ApiResponseUtil from "@/shared/utils/api-response.util";
import AppException from "@/shared/utils/exception.util";
import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Prevent headers already sent error
  if (res.headersSent) {
    return;
  }

  // Log the error
  logger.error(`Error in ${req.method} ${req.path}:`, {
    message: err.message,
    stack: env.isDevelopment ? err.stack : undefined,
  });

  // Handle AppException errors
  if (err instanceof AppException) {
    return ApiResponseUtil.error(res, err);
  }

  // For rate limit errors that might come as regular Error but with specific message
  if (
    err.message &&
    (err.message.includes("Too many requests") ||
      err.message.includes("rate limit") ||
      err.message.includes("Please wait"))
  ) {
    return ApiResponseUtil.error(res, new AppException(err.message, 429));
  }

  // Handle all other errors
  ApiResponseUtil.error(res, {
    status: 500,
    message: env.isDevelopment ? err.message : "Internal server error",
    description: env.isDevelopment
      ? err.stack?.split("\n")[0]
      : "An unexpected error occurred",
  });
};

export const setupUnhandledRejectionHandler = () => {
  process.on("unhandledRejection", (reason: Error) => {
    logger.error("Unhandled Rejection:", {
      message: reason.message,
      stack: reason.stack,
    });
  });
};

export const setupUncaughtExceptionHandler = () => {
  process.on("uncaughtException", (error: Error) => {
    logger.error("Uncaught Exception:", {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });
};
