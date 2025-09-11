import { Router, type Router as ExpressRouter } from "express";
import { DivisionController } from "../controllers/division.controller";
import { rateLimiter } from "../middlewares/rate-limiter.middleware";
import { RateLimitLevel } from "@/application/services/rate-limiter/rate-limiter.service";
import { PrismaClient } from "@prisma/client";
import { DivisionRepository } from "@/infrastructure/orm/repositories/division.repository";

const router: ExpressRouter = Router();

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize repository
const divisionRepository = new DivisionRepository(prisma);

// Initialize controller
const divisionController = new DivisionController(divisionRepository);

// ============================================
// Division Routes
// ============================================

/**
 * @route   GET /api/divisions
 * @desc    Get divisions catalog
 * @access  Public
 */
router.get(
  "/",
  rateLimiter(RateLimitLevel.LOW),
  divisionController.getDivisionsCatalog.bind(divisionController)
);

export default router;
