import { Router, type Router as ExpressRouter } from "express";
import { HealthCheckController } from "@/interfaces/controllers/health-check.controller";

const router: ExpressRouter = Router();
const healthCheckController = new HealthCheckController();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Comprehensive health check
 *     description: Performs a detailed health check including database connectivity, memory usage, and system status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [healthy, unhealthy]
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     uptime:
 *                       type: number
 *                     version:
 *                       type: string
 *                     environment:
 *                       type: string
 *                     checks:
 *                       type: object
 *                       properties:
 *                         database:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               enum: [healthy, unhealthy]
 *                             responseTime:
 *                               type: number
 *                             error:
 *                               type: string
 *                         memory:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               enum: [healthy, unhealthy]
 *                             used:
 *                               type: number
 *                             total:
 *                               type: number
 *                             percentage:
 *                               type: number
 *       503:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */
router.get(
  "/",
  healthCheckController.getHealthCheck.bind(healthCheckController)
);

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe
 *     description: Simple endpoint to check if the service is alive
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [alive]
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     uptime:
 *                       type: number
 */
router.get(
  "/live",
  healthCheckController.getLiveness.bind(healthCheckController)
);

export default router;
