import { IClubRepository } from "@/domain/repositories";
import AppException from "@/shared/utils/exception.util";
import { ROLE_NAMES, RoleName } from "@/shared/constants";

export interface DeleteClubRequest {
  id: string;
  userRoles: string[];
}

export class DeleteClubUseCase {
  constructor(private readonly clubRepository: IClubRepository) {}

  async execute(request: DeleteClubRequest): Promise<void> {
    const { id, userRoles } = request;

    // Validate user permissions - only committee and president can delete clubs
    this.validateDeletePermissions(userRoles);

    // Validate that the club exists
    const existingClub = await this.clubRepository.findById(id);
    if (!existingClub) {
      throw new AppException(`Club not found with ID: ${id}`, 404);
    }

    // Delete the club
    await this.clubRepository.delete(id);
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
        `Insufficient permissions. Only committee and president roles can delete clubs.`,
        403
      );
    }
  }
}
