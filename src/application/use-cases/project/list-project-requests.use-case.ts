import { IProjectRequestRepository } from "@/domain/repositories/project-request.repository";
import { IProjectRepository } from "@/domain/repositories/project.repository";
import {
  ProjectRequest,
  RequestStatus,
} from "@/domain/entities/project-request.entity";
import AppException from "@/shared/utils/exception.util";

export interface ListProjectRequestsInput {
  projectId: string;
  userId: string;
  userRoles: string[];
  status?: RequestStatus;
}

export interface ListProjectRequestsOutput {
  projectRequests: ProjectRequest[];
  total: number;
}

export class ListProjectRequestsUseCase {
  constructor(
    private readonly projectRequestRepository: IProjectRequestRepository,
    private readonly projectRepository: IProjectRepository
  ) {}

  async execute(
    request: ListProjectRequestsInput
  ): Promise<ListProjectRequestsOutput> {
    const { projectId, userId, userRoles, status } = request;

    // Validar que el proyecto existe
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new AppException(`Project not found with ID: ${projectId}`, 404);
    }

    // Validar permisos para ver las solicitudes
    this.validateViewPermissions(project, userId, userRoles);

    // Obtener las solicitudes del proyecto
    const projectRequests = await this.projectRequestRepository.findByProject(
      projectId,
      status
    );

    return {
      projectRequests,
      total: projectRequests.length,
    };
  }

  private validateViewPermissions(
    project: any,
    userId: string,
    userRoles: string[]
  ): void {
    const isProjectCreator = project.userId === userId;
    const hasAdminRole =
      userRoles.includes("committee") || userRoles.includes("president");
    const hasLeaderRole =
      userRoles.includes("leader") || userRoles.includes("co-leader");

    // El creador del proyecto siempre puede ver las solicitudes
    if (isProjectCreator) {
      return;
    }

    // committee y president pueden ver todas las solicitudes
    if (hasAdminRole) {
      return;
    }

    // leader y co-leader pueden gestionar solicitudes de proyectos de su división/club
    // Esta validación se debería extender para verificar la pertenencia específica
    if (hasLeaderRole) {
      return;
    }

    throw new AppException(
      "Insufficient permissions to view project requests",
      403
    );
  }
}
