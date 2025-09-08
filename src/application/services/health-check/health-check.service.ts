import prisma from "@/infrastructure/orm/prisma.client";
import logger from "@/infrastructure/logger";

export interface HealthCheckResult {
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: {
      status: "healthy" | "unhealthy";
      responseTime: number;
      error?: string;
    };
    memory: {
      status: "healthy" | "unhealthy";
      used: number;
      total: number;
      percentage: number;
    };
  };
}

export class HealthCheckService {
  private readonly startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  async performHealthCheck(): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();
    const uptime = Date.now() - this.startTime;

    const [databaseCheck, memoryCheck] = await Promise.allSettled([
      this.checkDatabase(),
      this.checkMemory(),
    ]);

    const database =
      databaseCheck.status === "fulfilled"
        ? databaseCheck.value
        : {
          status: "unhealthy" as const,
          responseTime: 0,
          error: databaseCheck.reason?.message,
        };

    const memory =
      memoryCheck.status === "fulfilled"
        ? memoryCheck.value
        : { status: "unhealthy" as const, used: 0, total: 0, percentage: 100 };

    const overallStatus =
      database.status === "healthy" && memory.status === "healthy"
        ? "healthy"
        : "unhealthy";

    return {
      status: overallStatus,
      timestamp,
      uptime,
      version: process.env["npm_package_version"] || "1.0.0",
      environment: process.env["NODE_ENV"] || "development",
      checks: {
        database,
        memory,
      },
    };
  }

  private async checkDatabase(): Promise<{
    status: "healthy" | "unhealthy";
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;

      logger.debug("Database health check successful", { responseTime });

      return {
        status: "healthy",
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown database error";

      logger.error("Database health check failed", {
        error: errorMessage,
        responseTime,
      });

      return {
        status: "unhealthy",
        responseTime,
        error: errorMessage,
      };
    }
  }

  private checkMemory(): {
    status: "healthy" | "unhealthy";
    used: number;
    total: number;
    percentage: number;
    } {
    const memoryUsage = process.memoryUsage();
    const used = memoryUsage.heapUsed;
    const total = memoryUsage.heapTotal;
    const percentage = (used / total) * 100;

    const isHealthy = percentage < 95;

    logger.debug("Memory health check", {
      used,
      total,
      percentage,
      status: isHealthy ? "healthy" : "unhealthy",
      threshold: "95%",
    });

    return {
      status: isHealthy ? "healthy" : "unhealthy",
      used,
      total,
      percentage: Math.round(percentage * 100) / 100,
    };
  }
}
