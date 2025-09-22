import { IClubRequestRepository } from "@/domain/repositories/club-request.repository";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { ClubRequest } from "@/domain/entities/club-request.entity";
import AppException from "@/shared/utils/exception.util";
import { ROLE_NAMES, RoleName } from "@/shared/constants";

export interface ProcessClubRequestRequest {
  requestId: string;
  action: "approve" | "reject";
  adminMessage?: string;
  userId: string; // El usuario que procesa la solicitud (leader/co-leader)
  userRoles: string[];
}

export interface ProcessClubRequestResponse {
  request: ClubRequest;
  message: string;
}

export class ProcessClubRequestUseCase {
  constructor(
    private readonly clubRequestRepository: IClubRequestRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(
    input: ProcessClubRequestRequest
  ): Promise<ProcessClubRequestResponse> {
    const { requestId, action, adminMessage, userId, userRoles } = input;

    // 1. Encontrar la solicitud
    const request = await this.clubRequestRepository.findById(requestId);
    if (!request) {
      throw new AppException("Club request not found", 404);
    }

    // 2. Verificar que la solicitud esté pendiente
    if (!request.isPending()) {
      throw new AppException("Only pending requests can be processed", 400);
    }

    // 3. Validar permisos del usuario
    await this.validateProcessPermissions(userId, request.clubId, userRoles);

    // 4. Procesar la solicitud
    const processedRequest =
      action === "approve"
        ? request.approve(adminMessage)
        : request.reject(adminMessage);

    // 5. Actualizar en la base de datos
    const updatedRequest = await this.clubRequestRepository.update(
      requestId,
      processedRequest
    );

    // 6. Si fue aprobada, agregar el usuario al club
    if (action === "approve") {
      await this.addUserToClub(request.userId, request.clubId);
    }

    return {
      request: updatedRequest,
      message: `Club request ${
        action === "approve" ? "approved" : "rejected"
      } successfully`,
    };
  }

  private async validateProcessPermissions(
    userId: string,
    clubId: string,
    userRoles: string[]
  ): Promise<void> {
    // Verificar que el usuario tenga rol de leader o co-leader
    const allowedRoles: RoleName[] = [ROLE_NAMES.LEADER, ROLE_NAMES.CO_LEADER];
    const hasAllowedRole = userRoles.some((role) =>
      allowedRoles.includes(role as RoleName)
    );

    if (!hasAllowedRole) {
      throw new AppException(
        "Insufficient permissions. Only leaders and co-leaders can process club requests.",
        403
      );
    }

    // Verificar que el usuario sea miembro del club correspondiente
    const userClubs = await this.userRepository.getUserClubs(userId);
    const isMemberOfClub = userClubs.includes(clubId);

    if (!isMemberOfClub) {
      throw new AppException(
        "You can only process requests for clubs you belong to.",
        403
      );
    }
  }

  private async addUserToClub(_userId: string, _clubId: string): Promise<void> {
    // Esta funcionalidad debería implementarse en el UserRepository
    // Para ahora, documentamos que se necesita implementar
    // await this.userRepository.addUserToClub(userId, clubId);
    // TODO: Implementar método addUserToClub en UserRepository
    // Por ahora dejamos un placeholder que se debe implementar en el repositorio
    // El usuario debe ser agregado al club cuando la solicitud es aprobada
  }
}
