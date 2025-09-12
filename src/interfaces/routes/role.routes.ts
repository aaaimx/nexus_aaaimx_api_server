import { Router, type Router as ExpressRouter } from "express";
import { RoleController } from "../controllers/role.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rateLimiter } from "../middlewares/rate-limiter.middleware";
import { RateLimitLevel } from "@/application/services/rate-limiter/rate-limiter.service";
import { PrismaClient } from "@prisma/client";
import { RoleRepository } from "@/infrastructure/orm/repositories/role.repository";

const router: ExpressRouter = Router();

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize repository
const roleRepository = new RoleRepository(prisma);

// Initialize controller
const roleController = new RoleController(roleRepository);

// ============================================
// Role Routes
// ============================================

/**
 * @route   GET /api/roles
 * @desc    Get roles catalog (restricted to non-member roles)
 * @access  Private (Authenticated users only, excluding members and senior members)
 */
router.get(
  "/",
  rateLimiter(RateLimitLevel.LOW),
  authMiddleware,
  roleController.getRolesCatalog.bind(roleController)
);

export default router;
