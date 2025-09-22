import { IDivisionRepository, UpdateDivisionData } from "@/domain/repositories";
import { Division } from "@/domain/entities";
import AppException from "@/shared/utils/exception.util";
import { ROLE_NAMES, RoleName } from "@/shared/constants";

export interface UpdateDivisionRequest extends UpdateDivisionData {
  id: string;
  userRoles: string[];
}

export interface UpdateDivisionResponse {
  division: Division;
}

export class UpdateDivisionUseCase {
  constructor(private readonly divisionRepository: IDivisionRepository) {}

  async execute(
    request: UpdateDivisionRequest
  ): Promise<UpdateDivisionResponse> {
    const { id, name, description, logoUrl, userRoles } = request;

    // Validate user permissions - only committee and president can update divisions
    this.validateUpdatePermissions(userRoles);

    // Validate that the division exists
    const existingDivision = await this.divisionRepository.findById(id);
    if (!existingDivision) {
      throw new AppException(`Division not found with ID: ${id}`, 404);
    }

    // If name is being updated, validate it's unique
    if (name && name !== existingDivision.name) {
      const divisionWithSameName = await this.divisionRepository.findByName(
        name
      );
      if (divisionWithSameName) {
        throw new AppException("Division with this name already exists", 400);
      }
    }

    // Update the division
    const updateData: UpdateDivisionData = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(logoUrl !== undefined && { logoUrl }),
    };
    const updatedDivision = await this.divisionRepository.update(
      id,
      updateData
    );

    return {
      division: updatedDivision,
    };
  }

  private validateUpdatePermissions(userRoles: string[]): void {
    const allowedRoles: RoleName[] = [
      ROLE_NAMES.COMMITTEE,
      ROLE_NAMES.PRESIDENT,
    ];

    const hasPermission = userRoles.some((role) =>
      allowedRoles.includes(role as RoleName)
    );

    if (!hasPermission) {
      throw new AppException(
        `Insufficient permissions. Only committee and president roles can update divisions.`,
        403
      );
    }
  }
}
