import { Router, type Router as ExpressRouter } from "express";
import { AccountController } from "@/interfaces/controllers/account.controller";
import { authMiddleware } from "@/interfaces/middlewares/auth.middleware";
import { verifiedEmailMiddleware } from "@/interfaces/middlewares/verified-email.middleware";
import {
  profilePhotoUpload,
  validateUploadedFile,
  handleMulterError,
} from "@/interfaces/middlewares/file-upload.middleware";
import { validateRequest } from "@/interfaces/middlewares/validation.middleware";
import { UpdateAccountSchema } from "@/interfaces/validators/schemas/account";
import { PrismaClient } from "@prisma/client";
import { UserRepository } from "@/infrastructure/orm/repositories";
import { FileStorageService } from "@/infrastructure/external-services";

const router: ExpressRouter = Router();

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize repositories
const userRepository = new UserRepository(prisma);

// Initialize external services
const fileStorageService = new FileStorageService();

// Initialize controllers
const accountController = new AccountController(
  userRepository,
  fileStorageService
);

// ============================================
// ACCOUNT ROUTES
// ============================================

/**
 * @swagger
 * /account/upload-profile-photo:
 *   post:
 *     summary: Upload user profile photo
 *     description: Uploads a profile photo for the authenticated user
 *     tags: [Account]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profile_photo:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo file (max 5MB, formats: jpg, jpeg, png, webp)
 *             required:
 *               - profile_photo
 *     responses:
 *       200:
 *         description: Profile photo uploaded successfully
 *       400:
 *         description: Invalid file or no file uploaded
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Email verification required
 *       404:
 *         description: User not found
 */
router.post(
  "/upload-profile-photo",
  authMiddleware,
  verifiedEmailMiddleware,
  profilePhotoUpload,
  handleMulterError,
  validateUploadedFile,
  accountController.uploadProfilePhoto.bind(accountController)
);

/**
 * @swagger
 * /account/profile-photo:
 *   get:
 *     summary: Get user profile photo
 *     description: Retrieves the authenticated user's profile photo
 *     tags: [Account]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile photo retrieved successfully
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Profile photo not found
 */
router.get(
  "/profile-photo",
  authMiddleware,
  verifiedEmailMiddleware,
  accountController.getProfilePhoto.bind(accountController)
);

/**
 * @swagger
 * /account:
 *   get:
 *     summary: Get user account information
 *     description: Retrieves the authenticated user's account information
 *     tags: [Account]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Account information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     photoUrl:
 *                       type: string
 *                     isEmailVerified:
 *                       type: boolean
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     lastLoginAt:
 *                       type: string
 *                       format: date-time
 *                     allowNotifications:
 *                       type: boolean
 *                     roleId:
 *                       type: string
 *                     divisions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     clubs:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Account is deactivated
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  authMiddleware,
  verifiedEmailMiddleware,
  accountController.getAccount.bind(accountController)
);

/**
 * @swagger
 * /account:
 *   put:
 *     summary: Update user account information
 *     description: Updates the authenticated user's account information (firstName, lastName, bio)
 *     tags: [Account]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: User's last name
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *                 description: User's biography
 *             example:
 *               firstName: "John"
 *               lastName: "Doe"
 *               bio: "Software engineer passionate about clean code"
 *     responses:
 *       200:
 *         description: Account information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     photoUrl:
 *                       type: string
 *                     isEmailVerified:
 *                       type: boolean
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     lastLoginAt:
 *                       type: string
 *                       format: date-time
 *                     allowNotifications:
 *                       type: boolean
 *                     roleId:
 *                       type: string
 *                     divisions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     clubs:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Account is deactivated
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/",
  authMiddleware,
  verifiedEmailMiddleware,
  validateRequest({ body: UpdateAccountSchema }),
  accountController.updateAccount.bind(accountController)
);

export default router;
