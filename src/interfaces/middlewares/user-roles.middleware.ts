import { Request, Response, NextFunction } from "express";
import { IRoleRepository } from "@/domain/repositories/role.repository";
import { IUserRepository } from "@/domain/repositories/user.repository";
import AppException from "@/shared/utils/exception.util";

// The Request interface is already declared in auth.middleware.ts
// We'll add roles dynamically to the user object

export const userRolesMiddleware = (
  userRepository: IUserRepository,
  _roleRepository: IRoleRepository
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new AppException("User not authenticated", 401);
      }

      // Get user with roles
      const user = await userRepository.findById(req.user.id);
      if (!user) {
        throw new AppException("User not found", 404);
      }

      // Get user roles
      const userRoles = await userRepository.getUserRoles(req.user.id);

      // Add roles to request user object
      (req.user as any).roles = userRoles.map((role) => role.name);

      next();
    } catch (error) {
      if (error instanceof AppException) {
        res.status(error.status).json({
          success: false,
          message: error.message,
          data: null,
          status: error.status,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
        data: null,
        status: 500,
      });
    }
  };
};
