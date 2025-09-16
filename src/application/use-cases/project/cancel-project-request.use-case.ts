import { IProjectRequestRepository } from "@/domain/repositories/project-request.repository";
import { IProjectRepository } from "@/domain/repositories/project.repository";
import AppException from "@/shared/utils/exception.util";

export interface CancelProjectRequestInput {
  requestId: string;
  projectId: string;
  userId: string;
  userRoles: string[];
}

export interface CancelProjectRequestOutput {
  success: boolean;
}

export class CancelProjectRequestUseCase {
  constructor(
    private readonly projectRequestRepository: IProjectRequestRepository,
    private readonly projectRepository: IProjectRepository
  ) {}

  async execute(
    request: CancelProjectRequestInput
  ): Promise<CancelProjectRequestOutput> {
    const { requestId, projectId, userId, userRoles } = request;

    // Validar que la solicitud existe
    const projectRequest = await this.projectRequestRepository.findById(
      requestId
    );
    if (!projectRequest) {
      throw new AppException(
        `Project request not found with ID: ${requestId}`,
        404
      );
    }

    // Validar que la solicitud pertenece al proyecto especificado
    if (projectRequest.projectId !== projectId) {
      throw new AppException(
        "Project request does not belong to the specified project",
        400
      );
    }

    // Validar que el proyecto existe
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new AppException(`Project not found with ID: ${projectId}`, 404);
    }

    // Validar permisos para cancelar la solicitud
    this.validateCancelPermissions(project, projectRequest, userId, userRoles);

    // Cancelar la solicitud (eliminarla)
    const success = await this.projectRequestRepository.delete(requestId);

    if (!success) {
      throw new AppException("Failed to cancel project request", 500);
    }

    return {
      success: true,
    };
  }

  private validateCancelPermissions(
    project: any,
    projectRequest: any,
    userId: string,
    userRoles: string[]
  ): void {
    const isRequestOwner = projectRequest.userId === userId;
    const isProjectCreator = project.userId === userId;
    const hasAdminRole =
      userRoles.includes("committee") || userRoles.includes("president");

    // El usuario que hizo la solicitud puede cancelarla
    if (isRequestOwner) {
      return;
    }

    // El creador del proyecto puede cancelar cualquier solicitud
    if (isProjectCreator) {
      return;
    }

    // committee y president pueden cancelar cualquier solicitud
    if (hasAdminRole) {
      return;
    }

    throw new AppException(
      "Insufficient permissions to cancel this project request",
      403
    );
  }
}
