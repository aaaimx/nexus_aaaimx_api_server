import { IUserRepository, IRoleRepository } from "@/domain/repositories";
import { UserWithRole } from "@/domain/entities";
import { RolePermissionService } from "@/application/services/role/role-permission.service";
import AppException from "@/shared/utils/exception.util";
import logger from "@/infrastructure/logger";

export interface AssignRoleInput {
  editorUserId: string;
  targetUserId: string;
  newRoleId: string;
}

export interface AssignRoleOutput {
  user: UserWithRole;
  message: string;
}

export class AssignRoleUseCase {
  private rolePermissionService: RolePermissionService;

  constructor(
    private readonly userRepository: IUserRepository,
    roleRepository: IRoleRepository
  ) {
    this.rolePermissionService = new RolePermissionService(
      userRepository,
      roleRepository
    );
  }

  async execute(input: AssignRoleInput): Promise<AssignRoleOutput> {
    try {
      const { editorUserId, targetUserId, newRoleId } = input;

      logger.info("Starting role assignment", {
        editorUserId,
        targetUserId,
        newRoleId,
      });

      // Validate permissions
      await this.rolePermissionService.validateRoleEditPermission(
        editorUserId,
        targetUserId,
        newRoleId
      );

      // Get current user information for logging
      const currentUser = await this.userRepository.findUserWithRole(
        targetUserId
      );
      if (!currentUser) {
        throw new AppException("Target user not found", 404);
      }

      const currentRole = currentUser.role;

      // Update user role
      await this.userRepository.updateUserRole(targetUserId, newRoleId);

      // Get updated user information
      const updatedUser = await this.userRepository.findUserWithRole(
        targetUserId
      );
      if (!updatedUser) {
        throw new AppException("Failed to retrieve updated user", 500);
      }

      logger.info("Role assignment completed successfully", {
        editorUserId,
        targetUserId,
        previousRole: currentRole.name,
        newRole: updatedUser.role.name,
      });

      return {
        user: updatedUser,
        message: `User role updated from '${currentRole.name}' to '${updatedUser.role.name}' successfully`,
      };
    } catch (error) {
      logger.error("Error in assign role use case", {
        error,
        editorUserId: input.editorUserId,
        targetUserId: input.targetUserId,
        newRoleId: input.newRoleId,
      });

      if (error instanceof AppException) {
        throw error;
      }

      throw new AppException(
        `Error assigning role: ${(error as Error).message}`,
        500
      );
    }
  }
}
