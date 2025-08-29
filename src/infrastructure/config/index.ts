// import CronFactory from "@/core/factories/cron.factory";
import { env } from "@/infrastructure/config/env.config";
// import logger from "@/infrastructure/logger";

const Config = {
  corsConfig: {
    origin: env.allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400, // 24 hours
  },
  swaggerConfig: {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Nexus AAAIMX API",
        version: "1.0.0",
        description: "API documentation for Nexus AAAIMX",
      },
      servers: [
        {
          url: env.apiUrl,
          description: "API Server",
        },
      ],
    },
    apis: ["./src/interfaces/routes/*.ts"],
  },
  swaggerMiddleware: {
    path: "/api-docs",
  },
  apiVersion: env.apiVersion,
};

// Initialize cron jobs
// const initializeCronJobs = (): void => {
//   try {
//     const cronService = CronFactory.createCronService();

//     // Start all cron jobs
//     cronService.startTransactionSummaryJob();
//     cronService.startCardDueDateReminderJob();
//     cronService.startCardCutoffReminderJob();
//     cronService.startOnboardingReminderJob();

//     logger.info("✅ Cron jobs initialized successfully");
//   } catch (error: unknown) {
//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error";
//     logger.error(`❌ Failed to initialize cron jobs: ${errorMessage}`);
//   }
// };

// export { initializeCronJobs };
export default Config;
