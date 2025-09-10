import AppException from "@/shared/utils/exception.util";
import { NextFunction, Request, Response } from "express";

export const verifiedEmailMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppException("Unauthorized: Authentication required", 401);
    }

    if (!req.user.emailVerified) {
      throw new AppException(
        "Forbidden: Email verification required to access this resource",
        403
      );
    }

    next();
  } catch (error) {
    if (error instanceof AppException) {
      next(error);
    } else {
      next(new AppException("Authentication failed", 401));
    }
  }
};
