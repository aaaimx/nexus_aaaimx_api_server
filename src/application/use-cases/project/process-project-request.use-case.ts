import { IProjectRequestRepository } from "@/domain/repositories/project-request.repository";
import { IProjectRepository } from "@/domain/repositories/project.repository";
import {
  ProjectRequest,
  RequestStatus,
} from "@/domain/entities/project-request.entity";
import AppException from "@/shared/utils/exception.util";

export interface ProcessProjectRequestInput {
  requestId: string;
  projectId: string;
  userId: string;
  userRoles: string[];
  status: RequestStatus;
  adminMessage?: string;
}

export interface ProcessProjectRequestOutput {
  projectRequest: ProjectRequest;
  memberAdded?: boolean;
}

export class ProcessProjectRequestUseCase {
  constructor(
    private readonly projectRequestRepository: IProjectRequestRepository,
    private readonly projectRepository: IProjectRepository
  ) {}

  async execute(
    request: ProcessProjectRequestInput
  ): Promise<ProcessProjectRequestOutput> {
    const { requestId, projectId, userId, userRoles, status, adminMessage } =
      request;

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

    // Validar que la solicitud está pendiente
    if (!projectRequest.canBeProcessed()) {
      throw new AppException(
        "Request can only be processed when in PENDING status",
        400
      );
    }

    // Validar que el proyecto existe
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new AppException(`Project not found with ID: ${projectId}`, 404);
    }

    // Validar permisos para procesar la solicitud
    this.validateProcessPermissions(project, userId, userRoles);

    // Procesar la solicitud
    let updatedRequest: ProjectRequest;
    let memberAdded = false;

    if (status === RequestStatus.APPROVED) {
      updatedRequest = projectRequest.approve(adminMessage);

      // Agregar el usuario como miembro del proyecto
      const addSuccess = await this.projectRepository.addMember(
        projectId,
        projectRequest.userId
      );

      if (!addSuccess) {
        throw new AppException("Failed to add user as project member", 500);
      }

      memberAdded = true;
    } else if (status === RequestStatus.REJECTED) {
      updatedRequest = projectRequest.reject(adminMessage);
    } else {
      throw new AppException(
        "Invalid status. Only APPROVED or REJECTED are allowed for processing",
        400
      );
    }

    // Actualizar la solicitud en la base de datos
    const savedRequest = await this.projectRequestRepository.update(
      requestId,
      updatedRequest
    );

    if (!savedRequest) {
      throw new AppException("Failed to update project request", 500);
    }

    return {
      projectRequest: savedRequest,
      memberAdded,
    };
  }

  private validateProcessPermissions(
    project: any,
    userId: string,
    userRoles: string[]
  ): void {
    const isProjectCreator = project.userId === userId;
    const hasAdminRole =
      userRoles.includes("committee") || userRoles.includes("president");
    const hasLeaderRole =
      userRoles.includes("leader") || userRoles.includes("co-leader");

    // El creador del proyecto siempre puede procesar solicitudes
    if (isProjectCreator) {
      return;
    }

    // committee y president pueden procesar todas las solicitudes
    if (hasAdminRole) {
      return;
    }

    // leader y co-leader pueden procesar solicitudes de proyectos de su división/club
    // Esta validación se debería extender para verificar la pertenencia específica
    if (hasLeaderRole) {
      return;
    }

    throw new AppException(
      "Insufficient permissions to process project requests",
      403
    );
  }
}
