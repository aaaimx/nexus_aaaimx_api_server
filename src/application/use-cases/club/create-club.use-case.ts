import { IClubRepository, CreateClubData } from "@/domain/repositories";
import { Club } from "@/domain/entities";
import AppException from "@/shared/utils/exception.util";
import { ROLE_NAMES, RoleName } from "@/shared/constants";

export interface CreateClubRequest extends CreateClubData {
  userRoles: string[];
}

export interface CreateClubResponse {
  club: Club;
}

export class CreateClubUseCase {
  constructor(private readonly clubRepository: IClubRepository) {}

  async execute(request: CreateClubRequest): Promise<CreateClubResponse> {
    const { name, description, logoUrl, userRoles } = request;

    // Validate user permissions - only committee and president can create clubs
    this.validateCreatePermissions(userRoles);

    // Validate that the name is unique
    const existingClub = await this.clubRepository.findByName(name);
    if (existingClub) {
      throw new AppException("Club with this name already exists", 400);
    }

    // Create the club
    const clubData: CreateClubData = {
      name,
      ...(description !== undefined && { description }),
      ...(logoUrl !== undefined && { logoUrl }),
    };
    const club = await this.clubRepository.create(clubData);

    return {
      club,
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
        `Insufficient permissions. Only committee and president roles can create clubs.`,
        403
      );
    }
  }
}
