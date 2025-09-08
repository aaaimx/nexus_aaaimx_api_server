import { Request, Response } from "express";
import { HealthCheckService } from "@/application/services/health-check/health-check.service";
import { ApiResponse } from "@/shared/utils/api-response.util";
import logger from "@/infrastructure/logger";

export class HealthCheckController {
  private healthCheckService: HealthCheckService;

  constructor() {
    this.healthCheckService = new HealthCheckService();
  }

  async getHealthCheck(_req: Request, res: Response): Promise<void> {
    try {
      const healthResult = await this.healthCheckService.performHealthCheck();

      const statusCode = healthResult.status === "healthy" ? 200 : 503;

      const response = new ApiResponse(
        healthResult.status === "healthy",
        healthResult.status === "healthy"
          ? "Service is healthy and operational"
          : "Service is experiencing issues",
        healthResult,
        statusCode
      );

      logger.info("Health check performed", {
        status: healthResult.status,
        responseTime: Date.now() - new Date(healthResult.timestamp).getTime(),
      });

      res.status(statusCode).json(response);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error during health check";

      logger.error("Health check failed", { error: errorMessage });

      const response = new ApiResponse(
        false,
        "Health check failed",
        {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          error: errorMessage,
        },
        500
      );

      res.status(500).json(response);
    }
  }

  async getLiveness(_req: Request, res: Response): Promise<void> {
    const response = new ApiResponse(
      true,
      "Service is alive",
      {
        status: "alive",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      200
    );

    res.status(200).json(response);
  }
}
