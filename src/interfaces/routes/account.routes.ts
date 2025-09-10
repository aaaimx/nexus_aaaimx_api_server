import { Router, type Router as ExpressRouter } from "express";
import { AccountController } from "@/interfaces/controllers/account.controller";
import { authMiddleware } from "@/interfaces/middlewares/auth.middleware";
import { verifiedEmailMiddleware } from "@/interfaces/middlewares/verified-email.middleware";
import {
  profilePhotoUpload,
  validateUploadedFile,
  handleMulterError,
} from "@/interfaces/middlewares/file-upload.middleware";
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

export default router;
