import { IUserRepository } from "@/domain/repositories";
import { UserWithRole } from "@/domain/entities";
import { RolePermissionService } from "@/application/services/role/role-permission.service";
import AppException from "@/shared/utils/exception.util";
import logger from "@/infrastructure/logger";

export interface GetUsersWithRolesInput {
  requesterUserId: string;
  skip?: number;
  limit?: number;
  divisionId?: string;
  clubId?: string;
  roleId?: string;
}

export interface GetUsersWithRolesOutput {
  users: UserWithRole[];
  total: number;
  message: string;
}

export class GetUsersWithRolesUseCase {
  private rolePermissionService: RolePermissionService;

  constructor(private readonly userRepository: IUserRepository) {
    this.rolePermissionService = new RolePermissionService(
      userRepository,
      {} as any // We don't need role repository for this use case
    );
  }

  async execute(
    input: GetUsersWithRolesInput
  ): Promise<GetUsersWithRolesOutput> {
    try {
      const {
        requesterUserId,
        skip = 0,
        limit = 50,
        divisionId,
        clubId,
        roleId,
      } = input;

      logger.info("Getting users with roles", {
        requesterUserId,
        skip,
        limit,
        divisionId,
        clubId,
        roleId,
      });

      // Check if user can view roles management
      const canView = await this.rolePermissionService.canViewRolesManagement(
        requesterUserId
      );
      if (!canView) {
        throw new AppException(
          "Insufficient permissions to view users and roles",
          403
        );
      }

      let result: { users: UserWithRole[]; total: number };

      // Filter by specific criteria
      if (divisionId) {
        const users = await this.userRepository.findUsersByDivision(divisionId);
        result = {
          users: users.slice(skip, skip + limit),
          total: users.length,
        };
      } else if (clubId) {
        const users = await this.userRepository.findUsersByClub(clubId);
        result = {
          users: users.slice(skip, skip + limit),
          total: users.length,
        };
      } else if (roleId) {
        const users = await this.userRepository.findUsersByRole(roleId);
        result = {
          users: users.slice(skip, skip + limit),
          total: users.length,
        };
      } else {
        // Get all users with roles
        result = await this.userRepository.findUsersWithRoles(skip, limit);
      }

      logger.info("Successfully retrieved users with roles", {
        requesterUserId,
        count: result.users.length,
        total: result.total,
      });

      return {
        users: result.users,
        total: result.total,
        message: `Retrieved ${result.users.length} users successfully`,
      };
    } catch (error) {
      logger.error("Error in get users with roles use case", {
        error,
        requesterUserId: input.requesterUserId,
      });

      if (error instanceof AppException) {
        throw error;
      }

      throw new AppException(
        `Error retrieving users with roles: ${(error as Error).message}`,
        500
      );
    }
  }
}
