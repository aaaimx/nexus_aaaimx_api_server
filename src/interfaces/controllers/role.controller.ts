import { Request, Response } from "express";
import { GetRolesCatalogUseCase } from "@/application/use-cases/role/get-roles-catalog.use-case";
import { IRoleRepository } from "@/domain/repositories";
import AppException from "@/shared/utils/exception.util";
import logger from "@/infrastructure/logger";

export class RoleController {
  private getRolesCatalogUseCase: GetRolesCatalogUseCase;

  constructor(roleRepository: IRoleRepository) {
    this.getRolesCatalogUseCase = new GetRolesCatalogUseCase(roleRepository);
  }

  /**
   * @route   GET /api/roles
   * @desc    Get roles catalog (restricted to non-member roles)
   * @access  Private (Authenticated users only, excluding members and senior members)
   */
  async getRolesCatalog(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Getting roles catalog", {
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        userId: req.user?.id,
        userRoleId: req.user?.roleId,
      });

      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
          data: null,
          status: 401,
        });
        return;
      }

      const roles = await this.getRolesCatalogUseCase.execute(req.user.roleId);

      res.status(200).json({
        success: true,
        message: "Roles catalog retrieved successfully",
        data: roles,
        status: 200,
      });
    } catch (error) {
      logger.error("Error in getRolesCatalog controller", {
        error,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        userId: req.user?.id,
        userRoleId: req.user?.roleId,
      });

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
  }
}
