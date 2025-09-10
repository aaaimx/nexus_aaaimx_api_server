import { Request, Response, NextFunction } from "express";
import { JwtService } from "@/infrastructure/external-services";
import AppException from "@/shared/utils/exception.util";

// Extend the Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roleId: string;
        emailVerified: boolean;
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const jwtService = new JwtService();

    // Extract token from request
    const token = jwtService.extractTokenFromRequest(req);

    // Verify and decode the token
    const decodedToken = jwtService.verifyAccessToken(token);

    // Set user information in request
    req.user = {
      id: decodedToken["id"],
      email: decodedToken["email"],
      roleId: decodedToken["roleId"],
      emailVerified: decodedToken["emailVerified"],
    };

    next();
  } catch (error) {
    const errorMessage =
      error instanceof AppException ? error.message : "Authentication failed";

    res.status(401).json({
      success: false,
      message: errorMessage,
      data: null,
      status: 401,
    });
  }
};
