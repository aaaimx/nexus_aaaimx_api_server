import { Router, type Router as ExpressRouter } from "express";
import { DivisionController } from "../controllers/division.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { userRolesMiddleware } from "../middlewares/user-roles.middleware";
import { rateLimiter } from "../middlewares/rate-limiter.middleware";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { RateLimitLevel } from "@/application/services/rate-limiter/rate-limiter.service";
import { PrismaClient } from "@prisma/client";
import {
  DivisionRepository,
  UserRepository,
  RoleRepository,
} from "@/infrastructure/orm/repositories";
import {
  CreateDivisionSchema,
  UpdateDivisionSchema,
  DivisionParamsSchema,
} from "../validators/schemas/division";

const router: ExpressRouter = Router();

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize repositories
const divisionRepository = new DivisionRepository(prisma);
const userRepository = new UserRepository(prisma);
const roleRepository = new RoleRepository(prisma);

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

/**
 * @route   POST /api/divisions
 * @desc    Create a new division
 * @access  Private (committee and president only)
 */
router.post(
  "/",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  userRolesMiddleware(userRepository, roleRepository),
  validationMiddleware(CreateDivisionSchema),
  divisionController.createDivision.bind(divisionController)
);

/**
 * @route   PUT /api/divisions/:id
 * @desc    Update an existing division
 * @access  Private (committee and president only)
 */
router.put(
  "/:id",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  userRolesMiddleware(userRepository, roleRepository),
  validationMiddleware(UpdateDivisionSchema),
  divisionController.updateDivision.bind(divisionController)
);

/**
 * @route   DELETE /api/divisions/:id
 * @desc    Delete a division
 * @access  Private (committee and president only)
 */
router.delete(
  "/:id",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  userRolesMiddleware(userRepository, roleRepository),
  validationMiddleware(DivisionParamsSchema),
  divisionController.deleteDivision.bind(divisionController)
);

export default router;
