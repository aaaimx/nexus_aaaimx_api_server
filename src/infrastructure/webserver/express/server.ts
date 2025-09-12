import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";

import Config from "@/infrastructure/config/index";
import { globalRateLimiter } from "@/interfaces/middlewares/rate-limiter.middleware";
import { timezoneMiddleware } from "@/interfaces/middlewares/timezone.middleware";
import healthCheckRoutes from "@/interfaces/routes/health-check.routes";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import {
  errorHandler,
  setupUncaughtExceptionHandler,
  setupUnhandledRejectionHandler,
} from "./error-handlers";

const app: Express = express();

// Disable X-Powered-By header for security
app.disable("x-powered-by");

// Parse cookies first - needed for auth tokens
app.use(cookieParser());

// CORS configuration - needed before routes
app.use(cors(Config.corsConfig));

// Serve static files from public folder
app.use(express.static("public"));

// Serve branding files with a specific route
app.use("/branding", express.static("public/branding"));

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Parse JSON bodies
app.use(express.json());

// Timezone middleware - automatically formats timestamps to Mexico timezone
app.use(timezoneMiddleware);

// Cookie debug middleware (only active in production when needed)
// Uncomment the line below when you need to debug cookie issues in production
// app.use(cookieDebugMiddleware);

// Health check routes (no rate limiting for monitoring systems)
app.use(`/api/v${Config.apiVersion}/health`, healthCheckRoutes);

// Global rate limiting
app.use(globalRateLimiter);

// Routes
import {
  authRoutes,
  accountRoutes,
  eventRoutes,
  divisionRoutes,
  clubRoutes,
  roleRoutes,
} from "@/interfaces/routes";
app.use(`/api/v${Config.apiVersion}/auth`, authRoutes);
app.use(`/api/v${Config.apiVersion}/account`, accountRoutes);
app.use(`/api/v${Config.apiVersion}/events`, eventRoutes);
app.use(`/api/v${Config.apiVersion}/divisions`, divisionRoutes);
app.use(`/api/v${Config.apiVersion}/clubs`, clubRoutes);
app.use(`/api/v${Config.apiVersion}/roles`, roleRoutes);

// Swagger documentation
const swaggerSpec = swaggerJsdoc(Config.swaggerConfig);
app.use(
  Config.swaggerMiddleware.path,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// Error handling middleware
app.use(errorHandler);

// Setup global error handlers
setupUncaughtExceptionHandler();
setupUnhandledRejectionHandler();

export default app;
