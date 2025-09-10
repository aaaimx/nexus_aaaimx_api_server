import { GoogleAuthUseCase } from "@/application/use-cases/auth/google-auth.use-case";
import { DefaultRoleService } from "@/application/services/auth";
import AuthFactory from "@/domain/factories/auth.factory";
import CookieService from "@/infrastructure/external-services/cookie.service";
import GoogleOAuthService from "@/infrastructure/external-services/google-oauth.service";
import logger from "@/infrastructure/logger";
import AppException from "@/shared/utils/exception.util";
import { Request, Response } from "express";

export class GoogleAuthController {
  private readonly jwtService = AuthFactory.getJwtServiceInstance();
  private readonly sessionService = AuthFactory.getSessionServiceInstance();

  constructor(
    private readonly googleAuthUseCase: GoogleAuthUseCase,
    private readonly googleOAuthService: GoogleOAuthService
  ) {}

  async initiateAuth(_req: Request, res: Response): Promise<void> {
    try {
      const authUrl = this.googleOAuthService.getAuthUrl();
      res.redirect(authUrl);
    } catch (error) {
      logger.error("Failed to initiate Google authentication", { error });
      res.status(500).json({
        success: false,
        message: "Failed to initiate Google authentication",
        data: null,
        status: 500,
      });
    }
  }

  async handleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.query;

      if (!code || typeof code !== "string") {
        res.status(400).json({
          success: false,
          message: "Authorization code is required",
          data: null,
          status: 400,
        });
        return;
      }

      const { access_token } = await this.googleOAuthService.getTokens(code);
      const googleUser = await this.googleOAuthService.getUserInfo(
        access_token
      );
      const { user } = await this.googleAuthUseCase.execute(googleUser);

      // Get the default role to use in the token
      const defaultRoleService = new DefaultRoleService(
        AuthFactory.getRoleRepositoryInstance()
      );
      const defaultRole = await defaultRoleService.getDefaultRole();

      const tokenPayload = {
        id: user.id,
        email: user.email,
        roleId: defaultRole.id,
        emailVerified: user.isEmailVerified,
      };

      const accessToken = this.jwtService.generateAccessToken(tokenPayload);
      const refreshToken = this.jwtService.generateRefreshToken(tokenPayload);

      // Update last session date asynchronously (don't await to avoid blocking the redirect)
      this.sessionService.updateLastSessionDate(user.id).catch((error) => {
        // Log error but don't block the authentication process
        logger.error(
          `Error updating last session date during Google auth: ${error}`
        );
      });

      CookieService.setAuthTokens(res, { accessToken, refreshToken });

      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Expose-Headers", "Set-Cookie");

      // Return success response with user data and tokens
      res.status(200).json({
        success: true,
        message: "Google authentication successful",
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isEmailVerified: user.isEmailVerified,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
        status: 200,
      });
    } catch (error: unknown) {
      logger.error("Google authentication callback failed", { error });

      const errorMessage =
        error instanceof AppException ? error.message : "Authentication failed";

      res.status(500).json({
        success: false,
        message: errorMessage,
        data: null,
        status: 500,
      });
    }
  }
}
