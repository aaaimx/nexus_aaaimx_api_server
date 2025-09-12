import { Router, type Router as ExpressRouter } from "express";
import { ClubController } from "../controllers/club.controller";
import { rateLimiter } from "../middlewares/rate-limiter.middleware";
import { RateLimitLevel } from "@/application/services/rate-limiter/rate-limiter.service";
import { PrismaClient } from "@prisma/client";
import { ClubRepository } from "@/infrastructure/orm/repositories/club.repository";

const router: ExpressRouter = Router();

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize repository
const clubRepository = new ClubRepository(prisma);

// Initialize controller
const clubController = new ClubController(clubRepository);

// ============================================
// Club Routes
// ============================================

/**
 * @route   GET /api/clubs
 * @desc    Get clubs catalog
 * @access  Public
 */
router.get(
  "/",
  rateLimiter(RateLimitLevel.LOW),
  clubController.getClubsCatalog.bind(clubController)
);

export default router;
