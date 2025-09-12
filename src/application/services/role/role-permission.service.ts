import { IUserRepository, IRoleRepository } from "@/domain/repositories";
import { UserWithRole } from "@/domain/entities";
import { ROLE_PERMISSIONS, ROLE_NAMES } from "@/shared/constants";
import AppException from "@/shared/utils/exception.util";
import logger from "@/infrastructure/logger";

export class RolePermissionService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository
  ) {}

  /**
   * Validates if a user can edit another user's role based on the hierarchy rules
   */
  async validateRoleEditPermission(
    editorUserId: string,
    targetUserId: string,
    newRoleId: string
  ): Promise<void> {
    try {
      // Get editor's role and information
      const editorUser = await this.userRepository.findUserWithRole(
        editorUserId
      );
      if (!editorUser) {
        throw new AppException("Editor user not found", 404);
      }

      // Get target user's information
      const targetUser = await this.userRepository.findUserWithRole(
        targetUserId
      );
      if (!targetUser) {
        throw new AppException("Target user not found", 404);
      }

      // Get the new role information
      const newRole = await this.roleRepository.findById(newRoleId);
      if (!newRole) {
        throw new AppException("New role not found", 404);
      }

      // Check if editor has permission to edit roles
      const editorPermissions =
        ROLE_PERMISSIONS[editorUser.role.name as keyof typeof ROLE_PERMISSIONS];
      if (!editorPermissions || editorPermissions.canEditRoles.length === 0) {
        throw new AppException("Insufficient permissions to edit roles", 403);
      }

      // Check if editor can assign the new role
      if (!editorPermissions.canEditRoles.includes(newRole.name as any)) {
        throw new AppException(
          `You cannot assign the role '${newRole.name}'`,
          403
        );
      }

      // Check scope-based permissions
      if (editorPermissions.scope === "same_division_club") {
        await this.validateSameDivisionClubPermission(editorUser, targetUser);
      }

      // Additional validation: prevent users from editing their own role to a higher level
      if (editorUserId === targetUserId) {
        await this.validateSelfRoleEdit(editorUser.role.name, newRole.name);
      }

      logger.info("Role edit permission validated successfully", {
        editorUserId,
        targetUserId,
        newRoleId,
        editorRole: editorUser.role.name,
        targetRole: targetUser.role.name,
        newRole: newRole.name,
      });
    } catch (error) {
      logger.error("Error validating role edit permission", {
        error,
        editorUserId,
        targetUserId,
        newRoleId,
      });

      if (error instanceof AppException) {
        throw error;
      }

      throw new AppException("Failed to validate role edit permission", 500);
    }
  }

  /**
   * Validates that the editor and target user are in the same division or club
   */
  private async validateSameDivisionClubPermission(
    editorUser: UserWithRole,
    targetUser: UserWithRole
  ): Promise<void> {
    const editorDivisions = editorUser.divisions?.map((d) => d.id) || [];
    const editorClubs = editorUser.clubs?.map((c) => c.id) || [];
    const targetDivisions = targetUser.divisions?.map((d) => d.id) || [];
    const targetClubs = targetUser.clubs?.map((c) => c.id) || [];

    // Check if they share any division
    const sharedDivisions = editorDivisions.filter((divId) =>
      targetDivisions.includes(divId)
    );

    // Check if they share any club
    const sharedClubs = editorClubs.filter((clubId) =>
      targetClubs.includes(clubId)
    );

    if (sharedDivisions.length === 0 && sharedClubs.length === 0) {
      throw new AppException(
        "You can only edit roles of users in the same division or club",
        403
      );
    }
  }

  /**
   * Validates that users cannot promote themselves to a higher role level
   */
  private async validateSelfRoleEdit(
    currentRoleName: string,
    newRoleName: string
  ): Promise<void> {
    // Define role hierarchy levels (lower number = higher level)
    const roleLevels = {
      [ROLE_NAMES.PRESIDENT]: 1,
      [ROLE_NAMES.COMMITTEE]: 2,
      [ROLE_NAMES.LEADER]: 3,
      [ROLE_NAMES.CO_LEADER]: 3,
      [ROLE_NAMES.MEMBER]: 4,
      [ROLE_NAMES.SENIOR_MEMBER]: 4,
    };

    const currentLevel = roleLevels[currentRoleName as keyof typeof roleLevels];
    const newLevel = roleLevels[newRoleName as keyof typeof roleLevels];

    if (currentLevel && newLevel && newLevel < currentLevel) {
      throw new AppException(
        "You cannot promote yourself to a higher role level",
        403
      );
    }
  }

  /**
   * Gets the list of roles that a user can assign to others
   */
  async getAssignableRoles(
    userId: string
  ): Promise<Array<{ id: string; name: string; description: string }>> {
    try {
      const user = await this.userRepository.findUserWithRole(userId);
      if (!user) {
        throw new AppException("User not found", 404);
      }

      const userPermissions =
        ROLE_PERMISSIONS[user.role.name as keyof typeof ROLE_PERMISSIONS];
      if (!userPermissions || userPermissions.canEditRoles.length === 0) {
        return [];
      }

      // Get all roles and filter by permissions
      const allRoles = await this.roleRepository.findAll();
      const assignableRoles = allRoles.filter((role) =>
        (userPermissions.canEditRoles as readonly string[]).includes(role.name)
      );

      return assignableRoles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
      }));
    } catch (error) {
      logger.error("Error getting assignable roles", { error, userId });

      if (error instanceof AppException) {
        throw error;
      }

      throw new AppException("Failed to get assignable roles", 500);
    }
  }

  /**
   * Checks if a user can view the roles management interface
   */
  async canViewRolesManagement(userId: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findUserWithRole(userId);
      if (!user) {
        return false;
      }

      const userPermissions =
        ROLE_PERMISSIONS[user.role.name as keyof typeof ROLE_PERMISSIONS];
      return userPermissions ? userPermissions.canEditRoles.length > 0 : false;
    } catch (error) {
      logger.error("Error checking roles management permission", {
        error,
        userId,
      });
      return false;
    }
  }
}
