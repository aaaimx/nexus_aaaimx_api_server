import AppException from "@/shared/utils/exception.util";
import jwt from "jsonwebtoken";
import { Request } from "express";

interface JwtPayload {
  id: string;
  [key: string]: any;
}

export default class JwtService {
  generateAccessToken(payload: JwtPayload): string {
    try {
      return jwt.sign(payload, process.env["JWT_SECRET"]!, {
        expiresIn: "15m",
      });
    } catch (error) {
      throw new AppException(
        `Error generating access token: ${(error as Error).message}`,
        500
      );
    }
  }

  generateRefreshToken(payload: JwtPayload): string {
    try {
      return jwt.sign(payload, process.env["JWT_REFRESH_SECRET"]!, {
        expiresIn: "7d",
      });
    } catch (error) {
      throw new AppException(
        `Error generating refresh token: ${(error as Error).message}`,
        500
      );
    }
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      if (!token) {
        throw new AppException("Unauthorized: Access token not found", 401);
      }
      return jwt.verify(token, process.env["JWT_SECRET"]!) as JwtPayload;
    } catch (error) {
      throw new AppException(
        `Invalid access token: ${(error as Error).message}`,
        401
      );
    }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      if (!token) {
        throw new AppException("Unauthorized: Refresh token not found", 401);
      }
      return jwt.verify(
        token,
        process.env["JWT_REFRESH_SECRET"]!
      ) as JwtPayload;
    } catch (error) {
      throw new AppException(
        `Invalid refresh token: ${(error as Error).message}`,
        401
      );
    }
  }

  getUserIdFromToken(token: string): string {
    const decoded = this.verifyAccessToken(token);
    const userId = decoded.id;
    if (!userId) {
      throw new AppException("Invalid token: userId is missing", 401);
    }
    return userId;
  }

  extractAndValidateToken(cookies: { access_token?: string }): JwtPayload {
    const token = cookies?.access_token;
    if (!token) throw new AppException("Unauthorized: Token not found", 401);
    return this.verifyAccessToken(token);
  }

  extractTokenFromRequest(req: Request): string {
    let token: string | null = null;

    // First try to get token from cookies
    if (req.cookies && req.cookies["access_token"]) {
      token = req.cookies["access_token"];
    }

    // If not in cookies, try from authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1] || null;
      }
    }

    if (!token) {
      throw new AppException("Unauthorized: No token provided", 401);
    }

    return token;
  }
}
