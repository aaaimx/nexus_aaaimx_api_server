import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";

import Config from "@/infrastructure/config/index";
import { globalRateLimiter } from "@/interfaces/middlewares/rate-limiter.middleware";
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

// Parse JSON bodies
app.use(express.json());

// Cookie debug middleware (only active in production when needed)
// Uncomment the line below when you need to debug cookie issues in production
// app.use(cookieDebugMiddleware);

// Global rate limiting
app.use(globalRateLimiter);

// Routes
//app.use(`/api/v${Config.apiVersion}`, authRoutes);

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
