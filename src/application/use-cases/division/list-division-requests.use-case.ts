import { IDivisionRequestRepository } from "@/domain/repositories/division-request.repository";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { DivisionRequest } from "@/domain/entities/division-request.entity";
import AppException from "@/shared/utils/exception.util";
import { ROLE_NAMES, RoleName } from "@/shared/constants";

export interface ListDivisionRequestsRequest {
  userId: string;
  userRoles: string[];
  divisionId?: string; // Opcional: filtrar por división específica
}

export interface ListDivisionRequestsResponse {
  requests: DivisionRequest[];
}

export class ListDivisionRequestsUseCase {
  constructor(
    private readonly divisionRequestRepository: IDivisionRequestRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(
    input: ListDivisionRequestsRequest
  ): Promise<ListDivisionRequestsResponse> {
    const { userId, userRoles, divisionId } = input;

    // Validar permisos del usuario
    await this.validateListPermissions(userId, userRoles, divisionId);

    let requests: DivisionRequest[] = [];

    if (divisionId) {
      // Listar solicitudes de una división específica
      requests = await this.divisionRequestRepository.findByDivision(divisionId);
    } else {
      // Listar solicitudes de todas las divisiones a las que pertenece el usuario
      const userDivisions = await this.userRepository.getUserDivisions(userId);
      
      // Obtener solicitudes de todas las divisiones del usuario
      for (const division of userDivisions) {
        const divisionRequests = await this.divisionRequestRepository.findByDivision(division);
        requests.push(...divisionRequests);
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
    divisionId?: string
  ): Promise<void> {
    // Verificar que el usuario tenga rol de leader o co-leader
    const allowedRoles: RoleName[] = [ROLE_NAMES.LEADER, ROLE_NAMES.CO_LEADER];
    const hasAllowedRole = userRoles.some((role) =>
      allowedRoles.includes(role as RoleName)
    );

    if (!hasAllowedRole) {
      throw new AppException(
        "Insufficient permissions. Only leaders and co-leaders can view division requests.",
        403
      );
    }

    // Si se especifica una división, verificar que el usuario pertenezca a ella
    if (divisionId) {
      const userDivisions = await this.userRepository.getUserDivisions(userId);
      const isMemberOfDivision = userDivisions.includes(divisionId);

      if (!isMemberOfDivision) {
        throw new AppException(
          "You can only view requests for divisions you belong to.",
          403
        );
      }
    }
  }
}
