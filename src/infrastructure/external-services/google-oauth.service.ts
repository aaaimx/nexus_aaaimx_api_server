import { env } from "@/infrastructure/config/env.config";
import AppException from "@/shared/utils/exception.util";
import { OAuth2Client } from "google-auth-library";

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export default class GoogleOAuthService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new OAuth2Client(
      env.googleClientId,
      env.googleClientSecret,
      env.googleCallbackUrl
    );
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      include_granted_scopes: true,
      response_type: "code",
    });
  }

  async getTokens(
    code: string
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return {
        access_token: tokens.access_token!,
        refresh_token: tokens.refresh_token!,
      };
    } catch {
      throw new AppException("Failed to get Google tokens", 400);
    }
  }

  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    try {
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new AppException("Failed to get Google user info", 400);
      }

      const data = await response.json();
      return data as GoogleUserInfo;
    } catch {
      throw new AppException("Failed to get Google user info", 400);
    }
  }
}
