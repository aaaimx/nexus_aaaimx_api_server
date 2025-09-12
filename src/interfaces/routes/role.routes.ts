import { Router, type Router as ExpressRouter } from "express";
import { RoleController } from "../controllers/role.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rateLimiter } from "../middlewares/rate-limiter.middleware";
import { validationMiddleware } from "../middlewares/validation.middleware";
import { RateLimitLevel } from "@/application/services/rate-limiter/rate-limiter.service";
import { PrismaClient } from "@prisma/client";
import {
  RoleRepository,
  UserRepository,
} from "@/infrastructure/orm/repositories";
import { AssignRoleSchema } from "../validators/schemas/role/assign-role.schema";
import { GetUsersWithRolesSchema } from "../validators/schemas/role/get-users-with-roles.schema";

const router: ExpressRouter = Router();

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize repositories
const roleRepository = new RoleRepository(prisma);
const userRepository = new UserRepository(prisma);

// Initialize controller
const roleController = new RoleController(roleRepository, userRepository);

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

/**
 * @route   GET /api/roles/assignable
 * @desc    Get roles that the current user can assign to others
 * @access  Private (Authenticated users with role management permissions)
 */
router.get(
  "/assignable",
  rateLimiter(RateLimitLevel.LOW),
  authMiddleware,
  roleController.getAssignableRoles.bind(roleController)
);

/**
 * @route   GET /api/roles/users
 * @desc    Get users with their roles (for role management interface)
 * @access  Private (Authenticated users with role management permissions)
 */
router.get(
  "/users",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  validationMiddleware(GetUsersWithRolesSchema, "query"),
  roleController.getUsersWithRoles.bind(roleController)
);

/**
 * @route   PUT /api/roles/assign
 * @desc    Assign a role to a user
 * @access  Private (Authenticated users with role management permissions)
 */
router.put(
  "/assign",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  validationMiddleware(AssignRoleSchema, "body"),
  roleController.assignRole.bind(roleController)
);

export default router;
