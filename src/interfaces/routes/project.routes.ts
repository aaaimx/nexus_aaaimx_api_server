import { Router, type Router as ExpressRouter } from "express";
import { ProjectController } from "../controllers/project.controller";
import { CreateProjectSchema } from "../validators/schemas/project/create-project.schema";
import { UpdateProjectSchema } from "../validators/schemas/project/update-project.schema";
import { ListProjectsSchema } from "../validators/schemas/project/list-projects.schema";
import { ProjectParamsSchema } from "../validators/schemas/project/project-params.schema";
import {
  AddProjectMemberSchema,
  RemoveProjectMemberSchema,
  GetProjectMembersSchema,
} from "../validators/schemas/project/manage-members.schema";
import {
  CreateProjectRequestSchema,
  ListProjectRequestsSchema,
  ProcessProjectRequestSchema,
  CancelProjectRequestSchema,
} from "../validators/schemas/project/project-request.schema";
import { authMiddleware } from "../middlewares/auth.middleware";
import { verifiedEmailMiddleware } from "../middlewares/verified-email.middleware";
import { userRolesMiddleware } from "../middlewares/user-roles.middleware";
import { rateLimiter } from "../middlewares/rate-limiter.middleware";
import { validateRequest } from "../middlewares/validation.middleware";
import { RateLimitLevel } from "@/application/services/rate-limiter/rate-limiter.service";
import { PrismaClient } from "@prisma/client";
import {
  ProjectRepository,
  UserRepository,
  RoleRepository,
} from "@/infrastructure/orm/repositories";
import { ProjectRequestRepository } from "@/infrastructure/orm/repositories/project-request.repository";

const router: ExpressRouter = Router();

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize repositories
const projectRepository = new ProjectRepository(prisma);
const userRepository = new UserRepository(prisma);
const roleRepository = new RoleRepository(prisma);
const projectRequestRepository = new ProjectRequestRepository(prisma);

// Initialize controller
const projectController = new ProjectController(
  projectRepository,
  userRepository,
  projectRequestRepository
);

// ============================================
// Project Routes
// ============================================

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private (Authenticated and verified users only)
 */
router.post(
  "/",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  userRolesMiddleware(userRepository, roleRepository),
  verifiedEmailMiddleware,
  validateRequest({ body: CreateProjectSchema.shape.body }),
  projectController.createProject.bind(projectController)
);

/**
 * @route   GET /api/projects
 * @desc    Get all projects with optional filters
 * @access  Private (Authenticated users only)
 */
router.get(
  "/",
  rateLimiter(RateLimitLevel.LOW),
  authMiddleware,
  userRolesMiddleware(userRepository, roleRepository),
  validateRequest({ query: ListProjectsSchema.shape.query }),
  projectController.listProjects.bind(projectController)
);

/**
 * @route   GET /api/projects/:id
 * @desc    Get a specific project by ID
 * @access  Private (Authenticated users only)
 */
router.get(
  "/:id",
  rateLimiter(RateLimitLevel.LOW),
  authMiddleware,
  userRolesMiddleware(userRepository, roleRepository),
  validateRequest({ params: ProjectParamsSchema.shape.params }),
  projectController.getProject.bind(projectController)
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Private (Authenticated and verified users only)
 */
router.put(
  "/:id",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  userRolesMiddleware(userRepository, roleRepository),
  verifiedEmailMiddleware,
  validateRequest({
    params: UpdateProjectSchema.shape.params,
    body: UpdateProjectSchema.shape.body,
  }),
  projectController.updateProject.bind(projectController)
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project
 * @access  Private (Authenticated and verified users only)
 */
router.delete(
  "/:id",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  userRolesMiddleware(userRepository, roleRepository),
  verifiedEmailMiddleware,
  validateRequest({ params: ProjectParamsSchema.shape.params }),
  projectController.deleteProject.bind(projectController)
);

// ============================================
// Project Members Routes
// ============================================

/**
 * @route   GET /api/projects/:id/members
 * @desc    Get project members
 * @access  Private (Authenticated users only)
 */
router.get(
  "/:id/members",
  rateLimiter(RateLimitLevel.LOW),
  authMiddleware,
  userRolesMiddleware(userRepository, roleRepository),
  validateRequest({ params: GetProjectMembersSchema.shape.params }),
  projectController.getProjectMembers.bind(projectController)
);

/**
 * @route   POST /api/projects/:id/members
 * @desc    Add a member to a project
 * @access  Private (Authenticated and verified users only)
 */
router.post(
  "/:id/members",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  userRolesMiddleware(userRepository, roleRepository),
  verifiedEmailMiddleware,
  validateRequest({
    params: AddProjectMemberSchema.shape.params,
    body: AddProjectMemberSchema.shape.body,
  }),
  projectController.addProjectMember.bind(projectController)
);

/**
 * @route   DELETE /api/projects/:id/members/:memberId
 * @desc    Remove a member from a project
 * @access  Private (Authenticated and verified users only)
 */
router.delete(
  "/:id/members/:memberId",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  userRolesMiddleware(userRepository, roleRepository),
  verifiedEmailMiddleware,
  validateRequest({ params: RemoveProjectMemberSchema.shape.params }),
  projectController.removeProjectMember.bind(projectController)
);

// ============================================
// Project Request Routes
// ============================================

/**
 * @route   POST /api/projects/:id/requests
 * @desc    Create a request to join a project
 * @access  Private (Authenticated and verified users only)
 */
router.post(
  "/:id/requests",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  userRolesMiddleware(userRepository, roleRepository),
  verifiedEmailMiddleware,
  validateRequest({
    params: CreateProjectRequestSchema.shape.params,
    body: CreateProjectRequestSchema.shape.body,
  }),
  projectController.createProjectRequest.bind(projectController)
);

/**
 * @route   GET /api/projects/:id/requests
 * @desc    Get all requests for a project
 * @access  Private (Authenticated users with proper permissions)
 */
router.get(
  "/:id/requests",
  rateLimiter(RateLimitLevel.LOW),
  authMiddleware,
  userRolesMiddleware(userRepository, roleRepository),
  validateRequest({
    params: ListProjectRequestsSchema.shape.params,
    query: ListProjectRequestsSchema.shape.query,
  }),
  projectController.listProjectRequests.bind(projectController)
);

/**
 * @route   PUT /api/projects/:id/requests/:requestId
 * @desc    Process a project request (approve/reject)
 * @access  Private (Authenticated users with proper permissions)
 */
router.put(
  "/:id/requests/:requestId",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  userRolesMiddleware(userRepository, roleRepository),
  verifiedEmailMiddleware,
  validateRequest({
    params: ProcessProjectRequestSchema.shape.params,
    body: ProcessProjectRequestSchema.shape.body,
  }),
  projectController.processProjectRequest.bind(projectController)
);

/**
 * @route   DELETE /api/projects/:id/requests/:requestId
 * @desc    Cancel a project request
 * @access  Private (Authenticated users with proper permissions)
 */
router.delete(
  "/:id/requests/:requestId",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  userRolesMiddleware(userRepository, roleRepository),
  validateRequest({ params: CancelProjectRequestSchema.shape.params }),
  projectController.cancelProjectRequest.bind(projectController)
);

export default router;
