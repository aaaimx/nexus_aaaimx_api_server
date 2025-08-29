import {
  RateLimitLevel,
  rateLimiterService,
} from "@/application/services/rate-limiter/rate-limiter.service";
import { NextFunction, Request, Response } from "express";

/**
 * Middleware of rate limiter
 * @param level Level of rate limiter to apply
 */
export const rateLimiter = (level: RateLimitLevel = RateLimitLevel.MEDIUM) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return rateLimiterService.getMiddleware(level)(req, res, next);
  };
};

/**
 * Global rate limiter middleware for the application
 * Can be applied at the application level for all routes
 */
export const globalRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return rateLimiterService.getMiddleware(RateLimitLevel.GLOBAL)(
    req,
    res,
    next
  );
};
