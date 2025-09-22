import { IClubRequestRepository } from "@/domain/repositories/club-request.repository";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { ClubRequest } from "@/domain/entities/club-request.entity";
import AppException from "@/shared/utils/exception.util";
import { ROLE_NAMES, RoleName } from "@/shared/constants";

export interface ListClubRequestsRequest {
  userId: string;
  userRoles: string[];
  clubId?: string; // Opcional: filtrar por club específico
}

export interface ListClubRequestsResponse {
  requests: ClubRequest[];
}

export class ListClubRequestsUseCase {
  constructor(
    private readonly clubRequestRepository: IClubRequestRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(
    input: ListClubRequestsRequest
  ): Promise<ListClubRequestsResponse> {
    const { userId, userRoles, clubId } = input;

    // Validar permisos del usuario
    await this.validateListPermissions(userId, userRoles, clubId);

    let requests: ClubRequest[] = [];

    if (clubId) {
      // Listar solicitudes de un club específico
      requests = await this.clubRequestRepository.findByClub(clubId);
    } else {
      // Listar solicitudes de todos los clubs a los que pertenece el usuario
      const userClubs = await this.userRepository.getUserClubs(userId);
      
      // Obtener solicitudes de todos los clubs del usuario
      for (const club of userClubs) {
        const clubRequests = await this.clubRequestRepository.findByClub(club);
        requests.push(...clubRequests);
      }

      // Ordenar por fecha de creación (más recientes primero)
      requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return {
      requests,
    };
  }

  private async validateListPermissions(
    userId: string,
    userRoles: string[],
    clubId?: string
  ): Promise<void> {
    // Verificar que el usuario tenga rol de leader o co-leader
    const allowedRoles: RoleName[] = [ROLE_NAMES.LEADER, ROLE_NAMES.CO_LEADER];
    const hasAllowedRole = userRoles.some((role) =>
      allowedRoles.includes(role as RoleName)
    );

    if (!hasAllowedRole) {
      throw new AppException(
        "Insufficient permissions. Only leaders and co-leaders can view club requests.",
        403
      );
    }

    // Si se especifica un club, verificar que el usuario pertenezca a él
    if (clubId) {
      const userClubs = await this.userRepository.getUserClubs(userId);
      const isMemberOfClub = userClubs.includes(clubId);

      if (!isMemberOfClub) {
        throw new AppException(
          "You can only view requests for clubs you belong to.",
          403
        );
      }
    }
  }
}
