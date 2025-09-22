import { IDivisionRepository } from "@/domain/repositories";
import AppException from "@/shared/utils/exception.util";
import { ROLE_NAMES, RoleName } from "@/shared/constants";

export interface DeleteDivisionRequest {
  id: string;
  userRoles: string[];
}

export class DeleteDivisionUseCase {
  constructor(private readonly divisionRepository: IDivisionRepository) {}

  async execute(request: DeleteDivisionRequest): Promise<void> {
    const { id, userRoles } = request;

    // Validate user permissions - only committee and president can delete divisions
    this.validateDeletePermissions(userRoles);

    // Validate that the division exists
    const existingDivision = await this.divisionRepository.findById(id);
    if (!existingDivision) {
      throw new AppException(`Division not found with ID: ${id}`, 404);
    }

    // Delete the division
    await this.divisionRepository.delete(id);
  }

  private validateDeletePermissions(userRoles: string[]): void {
    const allowedRoles: RoleName[] = [
      ROLE_NAMES.COMMITTEE,
      ROLE_NAMES.PRESIDENT,
    ];

    const hasPermission = userRoles.some((role) =>
      allowedRoles.includes(role as RoleName)
    );

    if (!hasPermission) {
      throw new AppException(
        `Insufficient permissions. Only committee and president roles can delete divisions.`,
        403
      );
    }
  }
}
