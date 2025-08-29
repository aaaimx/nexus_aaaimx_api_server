import { env } from "@/infrastructure/config/env.config";
// import { initializeCronJobs } from '@/infrastructure/config/index';
import logger from "@/infrastructure/logger";
import app from "@/infrastructure/webserver/express/server";
import "dotenv/config";

const server = app.listen(env.port, "0.0.0.0", () => {
  logger.info(`🚀 Server deployed on ${env.apiUrl}`);
});

// Initialize cron jobs after server starts
// initializeCronJobs();

// Increase timeouts to prevent WORKER TIMEOUT issues
server.keepAliveTimeout = 120000; // 120 seconds
server.headersTimeout = 120000; // 120 seconds
