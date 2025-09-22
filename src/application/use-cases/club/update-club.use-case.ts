import { IClubRepository, UpdateClubData } from "@/domain/repositories";
import { Club } from "@/domain/entities";
import AppException from "@/shared/utils/exception.util";
import { ROLE_NAMES, RoleName } from "@/shared/constants";

export interface UpdateClubRequest extends UpdateClubData {
  id: string;
  userRoles: string[];
}

export interface UpdateClubResponse {
  club: Club;
}

export class UpdateClubUseCase {
  constructor(private readonly clubRepository: IClubRepository) {}

  async execute(request: UpdateClubRequest): Promise<UpdateClubResponse> {
    const { id, name, description, logoUrl, userRoles } = request;

    // Validate user permissions - only committee and president can update clubs
    this.validateUpdatePermissions(userRoles);

    // Validate that the club exists
    const existingClub = await this.clubRepository.findById(id);
    if (!existingClub) {
      throw new AppException(`Club not found with ID: ${id}`, 404);
    }

    // If name is being updated, validate it's unique
    if (name && name !== existingClub.name) {
      const clubWithSameName = await this.clubRepository.findByName(name);
      if (clubWithSameName) {
        throw new AppException("Club with this name already exists", 400);
      }
    }

    // Update the club
    const updateData: UpdateClubData = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(logoUrl !== undefined && { logoUrl }),
    };
    const updatedClub = await this.clubRepository.update(id, updateData);

    return {
      club: updatedClub,
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
        `Insufficient permissions. Only committee and president roles can update clubs.`,
        403
      );
    }
  }
}
