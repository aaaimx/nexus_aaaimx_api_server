import ApiResponseUtil from "@/shared/utils/api-response.util";
import AppException from "@/shared/utils/exception.util";
import { NextFunction, Request, Response } from "express";

// Interface for predefined strategies
export interface RateLimitStrategy {
  windowMs: number;
  maxRequests: number;
  message: string;
  keyGenerator?: (req: Request) => string;
}

interface RateLimitRecord {
  count: number;
  lastRequest: number;
}

export enum RateLimitLevel {
  LOW = "low", // Low limit (many requests allowed)
  MEDIUM = "medium", // Medium limit (medium requests allowed)
  HIGH = "high", // High limit (few requests allowed)
  STRICT = "strict", // Strict limit (almost singleton)
  GLOBAL = "global", // Global limit for the entire API
}

export class RateLimiterService {
  private store: Map<string, RateLimitRecord> = new Map();

  private strategies: Record<string, RateLimitStrategy> = {
    [RateLimitLevel.LOW]: {
      windowMs: 60000, // 1 minute
      maxRequests: 250,
      message: "Rate limit exceeded. Please try again later.",
    },
    [RateLimitLevel.MEDIUM]: {
      windowMs: 60000, // 1 minute
      maxRequests: 200,
      message: "Rate limit exceeded. Please try again later.",
    },
    [RateLimitLevel.HIGH]: {
      windowMs: 60000, // 1 minute
      maxRequests: 100,
      message: "Rate limit exceeded. Please try again later.",
    },
    [RateLimitLevel.STRICT]: {
      windowMs: 60000, // 1 minute
      maxRequests: 70,
      message: "Rate limit exceeded. Please try again later.",
    },
    [RateLimitLevel.GLOBAL]: {
      windowMs: 60000, // 1 minute
      maxRequests: 150,
      message: "API rate limit exceeded. Please slow down your requests.",
    },
  };

  constructor() {
    // Clean expired entries periodically
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Adds a new strategy or updates an existing one
   */
  addStrategy(name: string, strategy: RateLimitStrategy): void {
    this.strategies[name] = strategy;
  }

  /**
   * Gets a middleware based on a named strategy
   */
  getMiddleware(
    strategyName: string = RateLimitLevel.MEDIUM
  ): (req: Request, res: Response, next: NextFunction) => void {
    const strategy =
      this.strategies[strategyName] || this.strategies[RateLimitLevel.MEDIUM];
    if (!strategy) {
      throw new AppException("Invalid rate limit strategy", 500);
    }
    return this.createMiddleware(strategy);
  }

  /**
   * Creates a custom middleware based on specific options
   */
  createMiddleware(
    options: RateLimitStrategy
  ): (req: Request, res: Response, next: NextFunction) => void {
    const {
      windowMs,
      maxRequests,
      message,
      keyGenerator = this.defaultKeyGenerator,
    } = options;

    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = keyGenerator(req);
        const now = Date.now();

        let record = this.store.get(key);
        if (!record) {
          record = { count: 0, lastRequest: now };
        }

        if (now - record.lastRequest > windowMs) {
          record = { count: 0, lastRequest: now };
        }

        record.count += 1;
        record.lastRequest = now;
        this.store.set(key, record);

        const remaining = Math.max(0, maxRequests - record.count);
        res.setHeader("X-RateLimit-Limit", maxRequests.toString());
        res.setHeader("X-RateLimit-Remaining", remaining.toString());
        res.setHeader(
          "X-RateLimit-Reset",
          new Date(now + windowMs).toISOString()
        );

        // Handle rate limit exceeded
        if (record.count > maxRequests) {
          const retryAfter = Math.ceil(windowMs / 1000);
          res.setHeader("Retry-After", retryAfter.toString());

          const rateLimitError = new AppException(message, 429);
          res.status(429);
          ApiResponseUtil.error(res, rateLimitError);
          return;
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  private defaultKeyGenerator(req: Request): string {
    return `${req.ip || "unknown"}:${req.path}`;
  }

  private cleanup(): void {
    const now = Date.now();
    this.store.forEach((record, key) => {
      if (now - record.lastRequest > 600000) {
        // 10 minutes as maximum expiration time
        this.store.delete(key);
      }
    });
  }
}

// Export a singleton instance
export const rateLimiterService = new RateLimiterService();
