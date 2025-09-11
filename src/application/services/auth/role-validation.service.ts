import { IUserRepository } from "@/domain/repositories/user.repository";
import { IRoleRepository } from "@/domain/repositories/role.repository";
import AppException from "@/shared/utils/exception.util";

export class RoleValidationService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository
  ) {}

  /**
   * Validates if user has permission to create events
   * According to BUSINESS_RULES_ROLES.md:
   * - committee, president: Can create events globally
   * - leader, co-leader: Can create events in their scope
   * - senior member, member: Cannot create events
   */
  async validateEventCreationPermission(userId: string): Promise<void> {
    const roleId = await this.userRepository.getUserRoleId(userId);

    if (!roleId) {
      throw new AppException("User role not found", 403);
    }

    // Get role name from roleId
    const role = await this.getRoleById(roleId);

    if (!role) {
      throw new AppException("Role not found", 403);
    }

    // Check if role has permission to create events
    const allowedRoles = ["committee", "president", "leader", "co-leader"];

    if (!allowedRoles.includes(role.name)) {
      throw new AppException(
        `Role '${role.name}' does not have permission to create events. Only committee, president, leader, and co-leader roles can create events.`,
        403
      );
    }
  }

  /**
   * Validates if user has permission to update events
   */
  async validateEventUpdatePermission(userId: string): Promise<void> {
    const roleId = await this.userRepository.getUserRoleId(userId);

    if (!roleId) {
      throw new AppException("User role not found", 403);
    }

    const role = await this.getRoleById(roleId);

    if (!role) {
      throw new AppException("Role not found", 403);
    }

    const allowedRoles = ["committee", "president", "leader", "co-leader"];

    if (!allowedRoles.includes(role.name)) {
      throw new AppException(
        `Role '${role.name}' does not have permission to update events. Only committee, president, leader, and co-leader roles can update events.`,
        403
      );
    }
  }

  /**
   * Validates if user has permission to delete events
   */
  async validateEventDeletionPermission(userId: string): Promise<void> {
    const roleId = await this.userRepository.getUserRoleId(userId);

    if (!roleId) {
      throw new AppException("User role not found", 403);
    }

    const role = await this.getRoleById(roleId);

    if (!role) {
      throw new AppException("Role not found", 403);
    }

    const allowedRoles = ["committee", "president", "leader", "co-leader"];

    if (!allowedRoles.includes(role.name)) {
      throw new AppException(
        `Role '${role.name}' does not have permission to delete events. Only committee, president, leader, and co-leader roles can delete events.`,
        403
      );
    }
  }

  /**
   * Get role by ID from the repository
   */
  private async getRoleById(roleId: string): Promise<{ name: string } | null> {
    const role = await this.roleRepository.findById(roleId);
    return role ? { name: role.name } : null;
  }
}
