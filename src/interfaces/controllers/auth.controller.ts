import { Request, Response } from "express";
import { ApiResponse } from "@/shared/utils/api-response.util";
import logger from "@/infrastructure/logger";
import { GoogleAuthUseCase } from "@/application/use-cases/auth/google-auth.use-case";
import { LoginUseCase } from "@/application/use-cases/auth/login.use-case";
import { RefreshTokenUseCase } from "@/application/use-cases/auth/refresh-token.use-case";
import { RequestResetPasswordUseCase } from "@/application/use-cases/auth/request-reset-password.use-case";
import { ResetPasswordUseCase } from "@/application/use-cases/auth/reset-password.use-case";
import { ValidateAccessUseCase } from "@/application/use-cases/auth/validate-access.use-case";
import {
  SignupUseCase,
  SignupInput,
} from "@/application/use-cases/auth/signup.use-case";
import { SendVerificationCodeUseCase } from "@/application/use-cases/auth/send-verification-code.use-case";
import { VerifyEmailUseCase } from "@/application/use-cases/auth/verify-email.use-case";
import { LoginSchemaType } from "@/interfaces/validators/schemas/user/login.schema";
import { RegisterSchemaType } from "@/interfaces/validators/schemas/user/register.schema";
import { VerifyEmailSchemaType } from "@/interfaces/validators/schemas/user/verify-email.schema";
import { RefreshTokenSchemaType } from "@/interfaces/validators/schemas/user/refresh-token.schema";
import { RequestResetPasswordSchemaType } from "@/interfaces/validators/schemas/user/request-reset-password.schema";
import { ResetPasswordSchemaType } from "@/interfaces/validators/schemas/user/reset-password.schema";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { IRoleRepository } from "@/domain/repositories/role.repository";
import {
  MailService,
  JwtService,
  PasswordService,
  VerificationCodeService,
} from "@/infrastructure/external-services";
import CookieService from "@/infrastructure/external-services/cookie.service";
import {
  DefaultRoleService,
  UserValidationService,
} from "@/application/services/auth";
import { SessionService } from "@/application/services/auth/session.service";
import AppException from "@/shared/utils/exception.util";

export class AuthController {
  private googleAuthUseCase: GoogleAuthUseCase;
  private loginUseCase: LoginUseCase;
  private refreshTokenUseCase: RefreshTokenUseCase;
  private requestResetPasswordUseCase: RequestResetPasswordUseCase;
  private resetPasswordUseCase: ResetPasswordUseCase;
  private validateAccessUseCase: ValidateAccessUseCase;
  private signupUseCase: SignupUseCase;
  private sendVerificationCodeUseCase: SendVerificationCodeUseCase;
  private verifyEmailUseCase: VerifyEmailUseCase;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly jwtService: JwtService
  ) {
    const defaultRoleService = new DefaultRoleService(roleRepository);
    const userValidationService = new UserValidationService(userRepository);
    const mailService = new MailService(userRepository);
    const passwordService = new PasswordService();
    const verificationCodeService = new VerificationCodeService();
    const sessionService = new SessionService(userRepository);

    this.googleAuthUseCase = new GoogleAuthUseCase(
      userRepository,
      mailService,
      roleRepository
    );
    this.loginUseCase = new LoginUseCase(
      userRepository,
      jwtService,
      passwordService,
      sessionService,
      defaultRoleService
    );
    this.refreshTokenUseCase = new RefreshTokenUseCase(
      userRepository,
      jwtService
    );
    this.requestResetPasswordUseCase = new RequestResetPasswordUseCase(
      userRepository,
      verificationCodeService,
      mailService
    );
    this.resetPasswordUseCase = new ResetPasswordUseCase(
      userRepository,
      passwordService,
      mailService
    );
    this.validateAccessUseCase = new ValidateAccessUseCase(userRepository);
    this.signupUseCase = new SignupUseCase(
      userRepository,
      passwordService,
      verificationCodeService,
      mailService,
      defaultRoleService,
      userValidationService
    );
    this.sendVerificationCodeUseCase = new SendVerificationCodeUseCase(
      userRepository,
      verificationCodeService,
      mailService
    );
    this.verifyEmailUseCase = new VerifyEmailUseCase(
      userRepository,
      verificationCodeService,
      mailService
    );
  }

  async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      // Check if Google OAuth is configured
      const clientId = process.env["GOOGLE_CLIENT_ID"];

      if (!clientId) {
        const response = new ApiResponse(
          false,
          "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID environment variable.",
          {
            message: "Google OAuth credentials not found",
            instructions: [
              "1. Go to Google Cloud Console (https://console.cloud.google.com/)",
              "2. Create a project or select an existing one",
              "3. Enable Google+ API or Google Identity API",
              "4. Create OAuth 2.0 credentials",
              "5. Set redirect URI to: http://localhost:8000/api/v1/auth/google/callback",
              "6. Set GOOGLE_CLIENT_ID environment variable",
            ],
            redirectUri: `${req.protocol}://${req.get(
              "host"
            )}/api/v1/auth/google/callback`,
          },
          400
        );

        logger.warn("Google OAuth not configured", {
          redirectUri: `${req.protocol}://${req.get(
            "host"
          )}/api/v1/auth/google/callback`,
        });

        res.status(400).json(response);
        return;
      }

      const redirectUri = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/google/callback`;
      const scope = "email profile";
      const responseType = "code";

      // Build Google OAuth URL
      const googleAuthUrl = new URL(
        "https://accounts.google.com/oauth/authorize"
      );
      googleAuthUrl.searchParams.set("client_id", clientId);
      googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
      googleAuthUrl.searchParams.set("scope", scope);
      googleAuthUrl.searchParams.set("response_type", responseType);
      googleAuthUrl.searchParams.set("access_type", "offline");
      googleAuthUrl.searchParams.set("prompt", "consent");

      logger.info("Redirecting to Google OAuth", {
        redirectUrl: googleAuthUrl.toString(),
        clientId: clientId.substring(0, 10) + "...",
      });

      // Debug: Log the full URL being generated
      logger.debug("Generated Google OAuth URL", {
        url: googleAuthUrl.toString(),
        clientId: clientId.substring(0, 10) + "...",
        redirectUri,
      });

      // Redirect to Google OAuth
      res.redirect(googleAuthUrl.toString());
    } catch (error) {
      const errorMessage =
        error instanceof AppException
          ? error.message
          : "Google OAuth initiation failed";

      logger.error("Google OAuth initiation failed", {
        error: errorMessage,
      });

      const response = new ApiResponse(
        false,
        errorMessage,
        null,
        error instanceof AppException ? error.status : 500
      );

      res
        .status(error instanceof AppException ? error.status : 500)
        .json(response);
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Extract refresh token from cookies
      const refreshToken = req.cookies?.["refresh_token"];

      if (!refreshToken) {
        throw new AppException("Refresh token not found in cookies", 401);
      }

      const input: RefreshTokenSchemaType = { refresh_token: refreshToken };

      const tokens = await this.refreshTokenUseCase.execute(input);

      // Set new authentication cookies
      CookieService.setAuthTokens(res, tokens);

      const response = new ApiResponse(
        true,
        "Token refreshed successfully",
        null, // Don't return tokens in response body for security
        200
      );

      logger.info("Token refreshed successfully", {
        refreshToken: refreshToken.substring(0, 10) + "...",
      });

      res.status(200).json(response);
    } catch (error) {
      const errorMessage =
        error instanceof AppException ? error.message : "Token refresh failed";

      logger.error("Token refresh failed", {
        error: errorMessage,
        cookies: req.cookies,
      });

      const response = new ApiResponse(
        false,
        errorMessage,
        null,
        error instanceof AppException ? error.status : 500
      );

      res
        .status(error instanceof AppException ? error.status : 500)
        .json(response);
    }
  }

  async requestResetPassword(req: Request, res: Response): Promise<void> {
    try {
      const input: RequestResetPasswordSchemaType = req.body;

      await this.requestResetPasswordUseCase.execute(input);

      const response = new ApiResponse(
        true,
        "Password reset email sent if account exists",
        null,
        200
      );

      logger.info("Password reset requested", {
        email: input.email,
      });

      res.status(200).json(response);
    } catch (error) {
      const errorMessage =
        error instanceof AppException
          ? error.message
          : "Password reset request failed";

      logger.error("Password reset request failed", {
        error: errorMessage,
        body: req.body,
      });

      const response = new ApiResponse(
        false,
        errorMessage,
        null,
        error instanceof AppException ? error.status : 500
      );

      res
        .status(error instanceof AppException ? error.status : 500)
        .json(response);
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const input: ResetPasswordSchemaType = req.body;

      await this.resetPasswordUseCase.execute(input);

      const response = new ApiResponse(
        true,
        "Password reset successfully",
        null,
        200
      );

      logger.info("Password reset successful", {
        email: input.email,
      });

      res.status(200).json(response);
    } catch (error) {
      const errorMessage =
        error instanceof AppException ? error.message : "Password reset failed";

      logger.error("Password reset failed", {
        error: errorMessage,
        body: req.body,
      });

      const response = new ApiResponse(
        false,
        errorMessage,
        null,
        error instanceof AppException ? error.status : 500
      );

      res
        .status(error instanceof AppException ? error.status : 500)
        .json(response);
    }
  }

  async validateAccess(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id; // Assuming user is set by auth middleware

      if (!userId) {
        throw new AppException("User ID not found in request", 401);
      }

      const input = { userId };
      const result = await this.validateAccessUseCase.execute(input);

      const response = new ApiResponse(
        true,
        "Access validated successfully",
        result,
        200
      );

      logger.info("Access validated", {
        userId,
      });

      res.status(200).json(response);
    } catch (error) {
      const errorMessage =
        error instanceof AppException
          ? error.message
          : "Access validation failed";

      logger.error("Access validation failed", {
        error: errorMessage,
        userId: req.user?.id,
      });

      const response = new ApiResponse(
        false,
        errorMessage,
        null,
        error instanceof AppException ? error.status : 500
      );

      res
        .status(error instanceof AppException ? error.status : 500)
        .json(response);
    }
  }

  async signup(req: Request, res: Response): Promise<void> {
    try {
      const input: RegisterSchemaType = req.body;

      // Convert to SignupInput format
      const signupInput: SignupInput = {
        first_name: input.first_name,
        last_name: input.last_name,
        email: input.email,
        password: input.password,
        birth_date: input.birth_date,
        ...(input.bio !== undefined && { bio: input.bio }),
      };

      const user = await this.signupUseCase.execute(signupInput);

      const response = new ApiResponse(
        true,
        "User registered successfully. Please check your email to verify your account.",
        user,
        201
      );

      logger.info("User signup successful", {
        email: input.email,
        userId: user.id,
      });

      res.status(201).json(response);
    } catch (error) {
      const errorMessage =
        error instanceof AppException ? error.message : "Signup failed";

      logger.error("Signup failed", {
        error: errorMessage,
        body: req.body,
      });

      const response = new ApiResponse(
        false,
        errorMessage,
        null,
        error instanceof AppException ? error.status : 500
      );

      res
        .status(error instanceof AppException ? error.status : 500)
        .json(response);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const input: LoginSchemaType = req.body;

      const result = await this.loginUseCase.execute(input);

      // Set authentication cookies
      CookieService.setAuthTokens(res, result.tokens);

      const response = new ApiResponse(
        true,
        "User logged in successfully",
        result.user,
        200
      );

      logger.info("User login successful", {
        email: input.email,
        userId: result.user.id,
      });

      res.status(200).json(response);
    } catch (error) {
      const errorMessage =
        error instanceof AppException ? error.message : "Login failed";

      logger.error("Login failed", {
        error: errorMessage,
        body: req.body,
      });

      const response = new ApiResponse(
        false,
        errorMessage,
        null,
        error instanceof AppException ? error.status : 500
      );

      res
        .status(error instanceof AppException ? error.status : 500)
        .json(response);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Clear authentication cookies
      CookieService.clearAuthTokens(res);

      const response = new ApiResponse(
        true,
        "User logged out successfully",
        null,
        200
      );

      logger.info("User logout successful", {
        userId: req.user?.id,
      });

      res.status(200).json(response);
    } catch (error) {
      const errorMessage =
        error instanceof AppException ? error.message : "Logout failed";

      logger.error("Logout failed", {
        error: errorMessage,
        userId: req.user?.id,
      });

      const response = new ApiResponse(
        false,
        errorMessage,
        null,
        error instanceof AppException ? error.status : 500
      );

      res
        .status(error instanceof AppException ? error.status : 500)
        .json(response);
    }
  }

  async sendVerificationCode(req: Request, res: Response): Promise<void> {
    try {
      const input: RequestResetPasswordSchemaType = req.body;

      const result = await this.sendVerificationCodeUseCase.execute(input);

      const response = new ApiResponse(true, result.message, null, 200);

      logger.info("Verification code sent", {
        email: input.email,
      });

      res.status(200).json(response);
    } catch (error) {
      const errorMessage =
        error instanceof AppException
          ? error.message
          : "Send verification code failed";

      logger.error("Send verification code failed", {
        error: errorMessage,
        body: req.body,
      });

      const response = new ApiResponse(
        false,
        errorMessage,
        null,
        error instanceof AppException ? error.status : 500
      );

      res
        .status(error instanceof AppException ? error.status : 500)
        .json(response);
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const input: VerifyEmailSchemaType = req.body;

      const result = await this.verifyEmailUseCase.execute(input);

      const response = new ApiResponse(
        true,
        result.message,
        {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            isEmailVerified: result.user.isEmailVerified,
            createdAt: result.user.createdAt,
            updatedAt: result.user.updatedAt,
          },
        },
        200
      );

      logger.info("Email verification successful", {
        email: input.email,
        userId: result.user.id,
      });

      res.status(200).json(response);
    } catch (error) {
      const errorMessage =
        error instanceof AppException
          ? error.message
          : "Email verification failed";

      logger.error("Email verification failed", {
        error: errorMessage,
        body: req.body,
      });

      const response = new ApiResponse(
        false,
        errorMessage,
        null,
        error instanceof AppException ? error.status : 500
      );

      res
        .status(error instanceof AppException ? error.status : 500)
        .json(response);
    }
  }

  async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, error } = req.query;

      // Check for OAuth errors
      if (error) {
        logger.error("Google OAuth error", { error });
        res.redirect(`/dashboard?error=${encodeURIComponent(error as string)}`);
        return;
      }

      if (!code) {
        throw new AppException("Authorization code is required", 400);
      }

      // Exchange authorization code for access token
      const clientId = process.env["GOOGLE_CLIENT_ID"];
      const clientSecret = process.env["GOOGLE_CLIENT_SECRET"];
      const redirectUri = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/google/callback`;

      if (!clientId || !clientSecret) {
        throw new AppException("Google OAuth credentials not configured", 500);
      }

      // Exchange code for token
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code as string,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        logger.error("Token exchange failed", { error: errorData });
        throw new AppException(
          "Failed to exchange authorization code for token",
          400
        );
      }

      const tokenData = (await tokenResponse.json()) as any;
      const accessToken = tokenData.access_token;

      // Get user info from Google
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
      );

      if (!userInfoResponse.ok) {
        throw new AppException("Failed to get user info from Google", 400);
      }

      const googleUser = (await userInfoResponse.json()) as any;

      // Use GoogleAuthUseCase to create or authenticate user
      const result = await this.googleAuthUseCase.execute(googleUser);

      // Get default role for token generation
      const defaultRoleService = new DefaultRoleService(this.roleRepository);
      const defaultRole = await defaultRoleService.getDefaultRole();

      // Generate tokens
      const tokenPayload = {
        id: result.user.id,
        email: result.user.email,
        roleId: defaultRole.id,
        emailVerified: result.user.isEmailVerified,
      };

      const jwtAccessToken = this.jwtService.generateAccessToken(tokenPayload);
      const jwtRefreshToken =
        this.jwtService.generateRefreshToken(tokenPayload);

      // Set authentication cookies
      CookieService.setAuthTokens(res, {
        accessToken: jwtAccessToken,
        refreshToken: jwtRefreshToken,
      });

      // Update last session date
      const sessionService = new SessionService(this.userRepository);
      await sessionService.updateLastSessionDate(result.user.id);

      logger.info("Google OAuth authentication successful", {
        userId: result.user.id,
        email: result.user.email,
      });

      // Redirect to dashboard with success
      res.redirect(
        "/dashboard?success=true&message=Google+OAuth+authentication+successful"
      );
    } catch (error) {
      const errorMessage =
        error instanceof AppException
          ? error.message
          : "Google OAuth callback failed";

      logger.error("Google OAuth callback failed", {
        error: errorMessage,
        query: req.query,
      });

      // Redirect to dashboard with error
      res.redirect(`/dashboard?error=${encodeURIComponent(errorMessage)}`);
    }
  }
}
