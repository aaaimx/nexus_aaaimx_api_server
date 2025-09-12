import { Request, Response } from "express";
import { GetRolesCatalogUseCase } from "@/application/use-cases/role/get-roles-catalog.use-case";
import { AssignRoleUseCase } from "@/application/use-cases/role/assign-role.use-case";
import { GetUsersWithRolesUseCase } from "@/application/use-cases/role/get-users-with-roles.use-case";
import { GetAssignableRolesUseCase } from "@/application/use-cases/role/get-assignable-roles.use-case";
import { IUserRepository, IRoleRepository } from "@/domain/repositories";
import AppException from "@/shared/utils/exception.util";
import logger from "@/infrastructure/logger";

export class RoleController {
  private getRolesCatalogUseCase: GetRolesCatalogUseCase;
  private assignRoleUseCase: AssignRoleUseCase;
  private getUsersWithRolesUseCase: GetUsersWithRolesUseCase;
  private getAssignableRolesUseCase: GetAssignableRolesUseCase;

  constructor(
    roleRepository: IRoleRepository,
    userRepository: IUserRepository
  ) {
    this.getRolesCatalogUseCase = new GetRolesCatalogUseCase(roleRepository);
    this.assignRoleUseCase = new AssignRoleUseCase(
      userRepository,
      roleRepository
    );
    this.getUsersWithRolesUseCase = new GetUsersWithRolesUseCase(
      userRepository
    );
    this.getAssignableRolesUseCase = new GetAssignableRolesUseCase(
      userRepository,
      roleRepository
    );
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

  /**
   * @route   GET /api/roles/assignable
   * @desc    Get roles that the current user can assign to others
   * @access  Private (Authenticated users with role management permissions)
   */
  async getAssignableRoles(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Getting assignable roles", {
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        userId: req.user?.id,
        userRoleId: req.user?.roleId,
      });

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
          data: null,
          status: 401,
        });
        return;
      }

      const result = await this.getAssignableRolesUseCase.execute({
        userId: req.user.id,
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.roles,
        status: 200,
      });
    } catch (error) {
      logger.error("Error in getAssignableRoles controller", {
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

  /**
   * @route   GET /api/roles/users
   * @desc    Get users with their roles (for role management interface)
   * @access  Private (Authenticated users with role management permissions)
   */
  async getUsersWithRoles(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Getting users with roles", {
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        userId: req.user?.id,
        userRoleId: req.user?.roleId,
        query: req.query,
      });

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
          data: null,
          status: 401,
        });
        return;
      }

      const skip = req.query["skip"]
        ? parseInt(req.query["skip"] as string)
        : 0;
      const limit = req.query["limit"]
        ? parseInt(req.query["limit"] as string)
        : 50;
      const divisionId = req.query["divisionId"] as string;
      const clubId = req.query["clubId"] as string;
      const roleId = req.query["roleId"] as string;

      const result = await this.getUsersWithRolesUseCase.execute({
        requesterUserId: req.user.id,
        skip,
        limit,
        divisionId,
        clubId,
        roleId,
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          users: result.users,
          total: result.total,
          pagination: {
            skip,
            limit,
            hasMore: skip + limit < result.total,
          },
        },
        status: 200,
      });
    } catch (error) {
      logger.error("Error in getUsersWithRoles controller", {
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

  /**
   * @route   PUT /api/roles/assign
   * @desc    Assign a role to a user
   * @access  Private (Authenticated users with role management permissions)
   */
  async assignRole(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Assigning role", {
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        userId: req.user?.id,
        userRoleId: req.user?.roleId,
        body: req.body,
      });

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
          data: null,
          status: 401,
        });
        return;
      }

      const { targetUserId, newRoleId } = req.body;

      if (!targetUserId || !newRoleId) {
        res.status(400).json({
          success: false,
          message: "targetUserId and newRoleId are required",
          data: null,
          status: 400,
        });
        return;
      }

      const result = await this.assignRoleUseCase.execute({
        editorUserId: req.user.id,
        targetUserId,
        newRoleId,
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.user,
        status: 200,
      });
    } catch (error) {
      logger.error("Error in assignRole controller", {
        error,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        userId: req.user?.id,
        userRoleId: req.user?.roleId,
        body: req.body,
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
