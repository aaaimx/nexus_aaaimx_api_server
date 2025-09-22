import { IDivisionRepository, CreateDivisionData } from "@/domain/repositories";
import { Division } from "@/domain/entities";
import AppException from "@/shared/utils/exception.util";
import { ROLE_NAMES, RoleName } from "@/shared/constants";

export interface CreateDivisionRequest extends CreateDivisionData {
  userRoles: string[];
}

export interface CreateDivisionResponse {
  division: Division;
}

export class CreateDivisionUseCase {
  constructor(private readonly divisionRepository: IDivisionRepository) {}

  async execute(
    request: CreateDivisionRequest
  ): Promise<CreateDivisionResponse> {
    const { name, description, logoUrl, userRoles } = request;

    // Validate user permissions - only committee and president can create divisions
    this.validateCreatePermissions(userRoles);

    // Validate that the name is unique
    const existingDivision = await this.divisionRepository.findByName(name);
    if (existingDivision) {
      throw new AppException("Division with this name already exists", 400);
    }

    // Create the division
    const divisionData: CreateDivisionData = {
      name,
      ...(description !== undefined && { description }),
      ...(logoUrl !== undefined && { logoUrl }),
    };
    const division = await this.divisionRepository.create(divisionData);

    return {
      division,
    };
  }

  private validateCreatePermissions(userRoles: string[]): void {
    const allowedRoles: RoleName[] = [
      ROLE_NAMES.COMMITTEE,
      ROLE_NAMES.PRESIDENT,
    ];

    const hasPermission = userRoles.some((role) =>
      allowedRoles.includes(role as RoleName)
    );

    if (!hasPermission) {
      throw new AppException(
        `Insufficient permissions. Only committee and president roles can create divisions.`,
        403
      );
    }
  }
}
