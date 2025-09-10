import { env } from "@/infrastructure/config/env.config";
import { Response } from "express";

export default class CookieService {
  private static readonly COOKIE_OPTIONS = {
    httpOnly: true,
    path: "/",
    domain: env.cookieDomain,
  };

  static setAuthTokens(
    res: Response,
    { accessToken, refreshToken }: { accessToken: string; refreshToken: string }
  ) {
    const isDevelopment = env.isDevelopment;
    const isProduction = env.isProduction;

    // Determine if we're dealing with cross-origin scenario
    const isCrossOrigin = env.cookieDomain && env.cookieDomain.includes(".");

    // Access Token - Short lived
    res.cookie("access_token", accessToken, {
      ...this.COOKIE_OPTIONS,
      secure: isProduction, // Always secure in production
      sameSite: isDevelopment ? "lax" : isCrossOrigin ? "none" : "strict", // Use 'none' only for cross-origin in production
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: "/",
      // Add specific mobile-friendly options
      ...(isProduction && {
        priority: "high" as const,
      }),
    });

    // Refresh Token - Long lived
    res.cookie("refresh_token", refreshToken, {
      ...this.COOKIE_OPTIONS,
      secure: isProduction, // Always secure in production
      sameSite: isDevelopment ? "lax" : isCrossOrigin ? "none" : "strict", // Use 'none' only for cross-origin in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
      // Add specific mobile-friendly options
      ...(isProduction && {
        priority: "high" as const,
      }),
    });
  }

  static clearAuthTokens(res: Response) {
    const isDevelopment = env.isDevelopment;
    const isCrossOrigin = env.cookieDomain && env.cookieDomain.includes(".");

    // Clear access token
    res.cookie("access_token", "", {
      ...this.COOKIE_OPTIONS,
      secure: !isDevelopment,
      sameSite: isDevelopment ? "lax" : isCrossOrigin ? "none" : "strict",
      expires: new Date(0),
    });

    // Clear refresh token
    res.cookie("refresh_token", "", {
      ...this.COOKIE_OPTIONS,
      secure: !isDevelopment,
      sameSite: isDevelopment ? "lax" : isCrossOrigin ? "none" : "strict",
      expires: new Date(0),
    });
  }
}
