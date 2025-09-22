import { IDivisionRequestRepository } from "@/domain/repositories/division-request.repository";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { DivisionRequest } from "@/domain/entities/division-request.entity";
import AppException from "@/shared/utils/exception.util";
import { ROLE_NAMES, RoleName } from "@/shared/constants";

export interface ProcessDivisionRequestRequest {
  requestId: string;
  action: "approve" | "reject";
  adminMessage?: string;
  userId: string; // El usuario que procesa la solicitud (leader/co-leader)
  userRoles: string[];
}

export interface ProcessDivisionRequestResponse {
  request: DivisionRequest;
  message: string;
}

export class ProcessDivisionRequestUseCase {
  constructor(
    private readonly divisionRequestRepository: IDivisionRequestRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(
    input: ProcessDivisionRequestRequest
  ): Promise<ProcessDivisionRequestResponse> {
    const { requestId, action, adminMessage, userId, userRoles } = input;

    // 1. Encontrar la solicitud
    const request = await this.divisionRequestRepository.findById(requestId);
    if (!request) {
      throw new AppException("Division request not found", 404);
    }

    // 2. Verificar que la solicitud esté pendiente
    if (!request.isPending()) {
      throw new AppException("Only pending requests can be processed", 400);
    }

    // 3. Validar permisos del usuario
    await this.validateProcessPermissions(
      userId,
      request.divisionId,
      userRoles
    );

    // 4. Procesar la solicitud
    const processedRequest =
      action === "approve"
        ? request.approve(adminMessage)
        : request.reject(adminMessage);

    // 5. Actualizar en la base de datos
    const updatedRequest = await this.divisionRequestRepository.update(
      requestId,
      processedRequest
    );

    // 6. Si fue aprobada, agregar el usuario a la división
    if (action === "approve") {
      await this.addUserToDivision(request.userId, request.divisionId);
    }

    return {
      request: updatedRequest,
      message: `Division request ${
        action === "approve" ? "approved" : "rejected"
      } successfully`,
    };
  }

  private async validateProcessPermissions(
    userId: string,
    divisionId: string,
    userRoles: string[]
  ): Promise<void> {
    // Verificar que el usuario tenga rol de leader o co-leader
    const allowedRoles: RoleName[] = [ROLE_NAMES.LEADER, ROLE_NAMES.CO_LEADER];
    const hasAllowedRole = userRoles.some((role) =>
      allowedRoles.includes(role as RoleName)
    );

    if (!hasAllowedRole) {
      throw new AppException(
        "Insufficient permissions. Only leaders and co-leaders can process division requests.",
        403
      );
    }

    // Verificar que el usuario sea miembro de la división correspondiente
    const userDivisions = await this.userRepository.getUserDivisions(userId);
    const isMemberOfDivision = userDivisions.includes(divisionId);

    if (!isMemberOfDivision) {
      throw new AppException(
        "You can only process requests for divisions you belong to.",
        403
      );
    }
  }

  private async addUserToDivision(
    _userId: string,
    _divisionId: string
  ): Promise<void> {
    // Esta funcionalidad debería implementarse en el UserRepository
    // Para ahora, documentamos que se necesita implementar
    // await this.userRepository.addUserToDivision(userId, divisionId);
    // TODO: Implementar método addUserToDivision en UserRepository
    // Por ahora dejamos un placeholder que se debe implementar en el repositorio
    // El usuario debe ser agregado a la división cuando la solicitud es aprobada
  }
}
