import { Router, type Router as ExpressRouter } from "express";
import { ClubController } from "../controllers/club.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { userRolesMiddleware } from "../middlewares/user-roles.middleware";
import { rateLimiter } from "../middlewares/rate-limiter.middleware";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { RateLimitLevel } from "@/application/services/rate-limiter/rate-limiter.service";
import { PrismaClient } from "@prisma/client";
import {
  ClubRepository,
  UserRepository,
  RoleRepository,
} from "@/infrastructure/orm/repositories";
import {
  CreateClubSchema,
  UpdateClubSchema,
  ClubParamsSchema,
} from "../validators/schemas/club";

const router: ExpressRouter = Router();

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize repositories
const clubRepository = new ClubRepository(prisma);
const userRepository = new UserRepository(prisma);
const roleRepository = new RoleRepository(prisma);

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

/**
 * @route   POST /api/clubs
 * @desc    Create a new club
 * @access  Private (committee and president only)
 */
router.post(
  "/",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  userRolesMiddleware(userRepository, roleRepository),
  validationMiddleware(CreateClubSchema),
  clubController.createClub.bind(clubController)
);

/**
 * @route   PUT /api/clubs/:id
 * @desc    Update an existing club
 * @access  Private (committee and president only)
 */
router.put(
  "/:id",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  userRolesMiddleware(userRepository, roleRepository),
  validationMiddleware(UpdateClubSchema),
  clubController.updateClub.bind(clubController)
);

/**
 * @route   DELETE /api/clubs/:id
 * @desc    Delete a club
 * @access  Private (committee and president only)
 */
router.delete(
  "/:id",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  userRolesMiddleware(userRepository, roleRepository),
  validationMiddleware(ClubParamsSchema),
  clubController.deleteClub.bind(clubController)
);

export default router;
