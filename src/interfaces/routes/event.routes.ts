import { Router, type Router as ExpressRouter } from "express";
import { EventController } from "../controllers/event.controller";
import { CreateEventSchema } from "../validators/schemas/event/create-event.schema";
import { UpdateEventSchema } from "../validators/schemas/event/update-event.schema";
import { ListEventsSchema } from "../validators/schemas/event/list-events.schema";
import { EventParamsSchema } from "../validators/schemas/event/event-params.schema";
import { authMiddleware } from "../middlewares/auth.middleware";
import { verifiedEmailMiddleware } from "../middlewares/verified-email.middleware";
import { rateLimiter } from "../middlewares/rate-limiter.middleware";
import { validateRequest } from "../middlewares/validation.middleware";
import { RateLimitLevel } from "@/application/services/rate-limiter/rate-limiter.service";
import { PrismaClient } from "@prisma/client";
import { EventRepository } from "@/infrastructure/orm/repositories/event.repository";
import { UserRepository } from "@/infrastructure/orm/repositories/user.repository";
import { RoleRepository } from "@/infrastructure/orm/repositories/role.repository";

const router: ExpressRouter = Router();

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize repositories
const eventRepository = new EventRepository(prisma);
const userRepository = new UserRepository(prisma);
const roleRepository = new RoleRepository(prisma);

// Initialize controller
const eventController = new EventController(
  eventRepository,
  userRepository,
  roleRepository
);

// ============================================
// Event Routes
// ============================================

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (Authenticated and verified users only)
 */
router.post(
  "/",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  verifiedEmailMiddleware,
  validateRequest({ body: CreateEventSchema }),
  eventController.createEvent.bind(eventController)
);

/**
 * @route   GET /api/events
 * @desc    Get all events with optional filters
 * @access  Public
 */
router.get(
  "/",
  rateLimiter(RateLimitLevel.LOW),
  validateRequest({ query: ListEventsSchema }),
  eventController.listEvents.bind(eventController)
);

/**
 * @route   GET /api/events/public
 * @desc    Get all public events
 * @access  Public
 */
router.get(
  "/public",
  rateLimiter(RateLimitLevel.LOW),
  validateRequest({ query: ListEventsSchema }),
  eventController.getPublicEvents.bind(eventController)
);

/**
 * @route   GET /api/events/upcoming
 * @desc    Get upcoming events
 * @access  Public
 */
router.get(
  "/upcoming",
  rateLimiter(RateLimitLevel.LOW),
  validateRequest({ query: ListEventsSchema }),
  eventController.getUpcomingEvents.bind(eventController)
);

/**
 * @route   GET /api/events/my-events
 * @desc    Get current user's events
 * @access  Private (Authenticated and verified users only)
 */
router.get(
  "/my-events",
  rateLimiter(RateLimitLevel.LOW),
  authMiddleware,
  verifiedEmailMiddleware,
  validateRequest({ query: ListEventsSchema }),
  eventController.getUserEvents.bind(eventController)
);

/**
 * @route   GET /api/events/:eventId
 * @desc    Get a specific event by ID
 * @access  Public
 */
router.get(
  "/:eventId",
  rateLimiter(RateLimitLevel.LOW),
  validateRequest({ params: EventParamsSchema }),
  eventController.getEvent.bind(eventController)
);

/**
 * @route   PUT /api/events/:eventId
 * @desc    Update an event
 * @access  Private (Event creator only, authenticated and verified)
 */
router.put(
  "/:eventId",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  verifiedEmailMiddleware,
  validateRequest({
    params: EventParamsSchema,
    body: UpdateEventSchema,
  }),
  eventController.updateEvent.bind(eventController)
);

/**
 * @route   DELETE /api/events/:eventId
 * @desc    Delete an event
 * @access  Private (Event creator only, authenticated and verified)
 */
router.delete(
  "/:eventId",
  rateLimiter(RateLimitLevel.HIGH),
  authMiddleware,
  verifiedEmailMiddleware,
  validateRequest({ params: EventParamsSchema }),
  eventController.deleteEvent.bind(eventController)
);

/**
 * @route   POST /api/events/:eventId/register
 * @desc    Register for an event
 * @access  Private (Authenticated and verified users only)
 */
router.post(
  "/:eventId/register",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  verifiedEmailMiddleware,
  validateRequest({ params: EventParamsSchema }),
  eventController.registerForEvent.bind(eventController)
);

/**
 * @route   POST /api/events/:eventId/cancel
 * @desc    Cancel event registration
 * @access  Private (Authenticated and verified users only)
 */
router.post(
  "/:eventId/cancel",
  rateLimiter(RateLimitLevel.MEDIUM),
  authMiddleware,
  verifiedEmailMiddleware,
  validateRequest({ params: EventParamsSchema }),
  eventController.cancelEventRegistration.bind(eventController)
);

export default router;
