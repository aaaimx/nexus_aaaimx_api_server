import { Router, type Router as ExpressRouter } from "express";
import { AuthController } from "@/interfaces/controllers/auth.controller";
import { GoogleAuthController } from "@/interfaces/controllers/google-auth.controller";
import { LoginSchema } from "@/interfaces/validators/schemas/user/login.schema";
import { RegisterSchema } from "@/interfaces/validators/schemas/user/register.schema";
import { VerifyEmailSchema } from "@/interfaces/validators/schemas/user/verify-email.schema";
import { RequestResetPasswordSchema } from "@/interfaces/validators/schemas/user/request-reset-password.schema";
import { ResetPasswordSchema } from "@/interfaces/validators/schemas/user/reset-password.schema";
import { authMiddleware } from "@/interfaces/middlewares/auth.middleware";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import {
  UserRepository,
  RoleRepository,
} from "@/infrastructure/orm/repositories";
import { JwtService } from "@/infrastructure/external-services";
import GoogleAuthFactory from "@/domain/factories/google-auth.factory";

const router: ExpressRouter = Router();

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize repositories
const userRepository = new UserRepository(prisma);
const roleRepository = new RoleRepository(prisma);

// Initialize external services
const jwtService = new JwtService();

// Initialize controllers with real dependencies
const authController = new AuthController(
  userRepository,
  roleRepository,
  jwtService
);

const googleAuthController = new GoogleAuthController(
  GoogleAuthFactory.createGoogleAuthUseCase(),
  GoogleAuthFactory.getGoogleOAuthServiceInstance()
);

// ============================================
// AUTHENTICATION ROUTES
// ============================================

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Create new user account
 *     description: Creates a new user account and sends verification code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               last_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               birth_date:
 *                 type: string
 *                 format: date-time
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *               - birth_date
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Email already exists
 */
router.post(
  "/signup",
  (req, res, next) => {
    try {
      RegisterSchema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        data: error instanceof z.ZodError ? error.issues : null,
      });
    }
  },
  authController.signup.bind(authController)
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates user and returns JWT tokens in cookies
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 */
router.post(
  "/login",
  (req, res, next) => {
    try {
      LoginSchema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        data: error instanceof z.ZodError ? error.issues : null,
      });
    }
  },
  authController.login.bind(authController)
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logs out user by clearing authentication cookies
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/logout",
  authMiddleware,
  authController.logout.bind(authController)
);

/**
 * @swagger
 * /auth/send-verification-code:
 *   post:
 *     summary: Send verification code
 *     description: Sends verification code to user's email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *       400:
 *         description: Invalid email format
 */
router.post(
  "/send-verification-code",
  (req, res, next) => {
    try {
      RequestResetPasswordSchema.parse(req.body); // Reusing schema for email validation
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        data: error instanceof z.ZodError ? error.issues : null,
      });
    }
  },
  authController.sendVerificationCode.bind(authController)
);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify email
 *     description: Verifies user's email using verification code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               verification_code:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *             required:
 *               - email
 *               - verification_code
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired verification code
 */
router.post(
  "/verify-email",
  (req, res, next) => {
    try {
      VerifyEmailSchema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        data: error instanceof z.ZodError ? error.issues : null,
      });
    }
  },
  authController.verifyEmail.bind(authController)
);

/**
 * @swagger
 * /auth/validate-access:
 *   get:
 *     summary: Validate access
 *     description: Validates if user's session token is valid and account is verified
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access validated successfully
 *       401:
 *         description: Invalid or expired token
 *       403:
 *         description: Account not verified
 */
router.get(
  "/validate-access",
  authMiddleware,
  authController.validateAccess.bind(authController)
);

/**
 * @swagger
 * /auth/request-reset-password:
 *   post:
 *     summary: Request password reset
 *     description: Requests password reset for user's email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Reset code sent successfully
 *       400:
 *         description: Invalid email format
 */
router.post(
  "/request-reset-password",
  (req, res, next) => {
    try {
      RequestResetPasswordSchema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        data: error instanceof z.ZodError ? error.issues : null,
      });
    }
  },
  authController.requestResetPassword.bind(authController)
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Resets user's password using code sent to email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               reset_password_code:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *               new_password:
 *                 type: string
 *                 minLength: 8
 *             required:
 *               - email
 *               - reset_password_code
 *               - new_password
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired reset code
 */
router.post(
  "/reset-password",
  (req, res, next) => {
    try {
      ResetPasswordSchema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        data: error instanceof z.ZodError ? error.issues : null,
      });
    }
  },
  authController.resetPassword.bind(authController)
);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Refreshes user's access token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh-token", authController.refreshToken.bind(authController));

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Google OAuth authentication
 *     description: Initiates Google OAuth authentication flow
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth consent screen
 */
router.get(
  "/google",
  googleAuthController.initiateAuth.bind(googleAuthController)
);

// Debug endpoint to check Google OAuth configuration
router.get("/google/debug", (_req, res) => {
  const clientId = process.env["GOOGLE_CLIENT_ID"];
  const clientSecret = process.env["GOOGLE_CLIENT_SECRET"];
  const redirectUri = `${_req.protocol}://${_req.get(
    "host"
  )}/api/v1/auth/google/callback`;

  res.json({
    success: true,
    message: "Google OAuth Debug Information",
    data: {
      clientId: clientId ? `${clientId.substring(0, 10)}...` : "Not set",
      clientSecret: clientSecret ? "Set" : "Not set",
      redirectUri,
      expectedRedirectUri: "http://localhost:8000/api/v1/auth/google/callback",
      isConfigured: !!(clientId && clientSecret),
      instructions: [
        "1. Go to Google Cloud Console: https://console.cloud.google.com/",
        "2. Select your project",
        "3. Go to APIs & Services > Credentials",
        "4. Edit your OAuth 2.0 Client ID",
        "5. Add this exact redirect URI: http://localhost:8000/api/v1/auth/google/callback",
        "6. Save the changes",
      ],
    },
  });
});

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     description: Callback endpoint for Google OAuth authentication
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *     responses:
 *       302:
 *         description: Redirects to dashboard on success
 *       400:
 *         description: Invalid authorization code
 */
router.get(
  "/google/callback",
  googleAuthController.handleCallback.bind(googleAuthController)
);

export default router;
