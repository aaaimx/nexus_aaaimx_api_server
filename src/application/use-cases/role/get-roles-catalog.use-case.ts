import { IRoleRepository } from "@/domain/repositories";
import { Role } from "@/domain/entities";
import AppException from "@/shared/utils/exception.util";
import logger from "@/infrastructure/logger";

export class GetRolesCatalogUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(userRoleId: string): Promise<Role[]> {
    try {
      logger.info("Getting roles catalog", { userRoleId });

      // Get user's role to check permissions
      const userRole = await this.roleRepository.findById(userRoleId);

      if (!userRole) {
        throw new AppException("User role not found", 404);
      }

      // Check if user has permission to view roles catalog
      // Only users who are NOT "member" or "senior member" can view roles
      if (userRole.name === "member" || userRole.name === "senior member") {
        throw new AppException(
          "Insufficient permissions to view roles catalog",
          403
        );
      }

      const roles = await this.roleRepository.findAll();

      logger.info(
        `Successfully retrieved ${
          roles?.length || 0
        } roles for user with role: ${userRole.name}`
      );

      return roles || [];
    } catch (error) {
      logger.error("Error getting roles catalog", { error, userRoleId });

      if (error instanceof AppException) {
        throw error;
      }

      throw new AppException("Failed to retrieve roles catalog", 500);
    }
  }
}
