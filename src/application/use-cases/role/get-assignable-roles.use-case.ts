import { IUserRepository, IRoleRepository } from "@/domain/repositories";
import { RolePermissionService } from "@/application/services/role/role-permission.service";
import AppException from "@/shared/utils/exception.util";
import logger from "@/infrastructure/logger";

export interface GetAssignableRolesInput {
  userId: string;
}

export interface GetAssignableRolesOutput {
  roles: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  message: string;
}

export class GetAssignableRolesUseCase {
  private rolePermissionService: RolePermissionService;

  constructor(
    userRepository: IUserRepository,
    roleRepository: IRoleRepository
  ) {
    this.rolePermissionService = new RolePermissionService(
      userRepository,
      roleRepository
    );
  }

  async execute(
    input: GetAssignableRolesInput
  ): Promise<GetAssignableRolesOutput> {
    try {
      const { userId } = input;

      logger.info("Getting assignable roles", { userId });

      // Get assignable roles based on user's permissions
      const roles = await this.rolePermissionService.getAssignableRoles(userId);

      logger.info("Successfully retrieved assignable roles", {
        userId,
        roleCount: roles.length,
      });

      return {
        roles,
        message: `Retrieved ${roles.length} assignable roles successfully`,
      };
    } catch (error) {
      logger.error("Error in get assignable roles use case", {
        error,
        userId: input.userId,
      });

      if (error instanceof AppException) {
        throw error;
      }

      throw new AppException(
        `Error retrieving assignable roles: ${(error as Error).message}`,
        500
      );
    }
  }
}
