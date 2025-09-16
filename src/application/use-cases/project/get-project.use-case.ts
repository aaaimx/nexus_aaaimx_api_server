import { IProjectRepository } from "@/domain/repositories/project.repository";
import { Project } from "@/domain/entities/project.entity";
import AppException from "@/shared/utils/exception.util";

export interface GetProjectRequest {
  projectId: string;
  userId: string;
  userRoles: string[];
}

export interface GetProjectResponse {
  project: Project;
}

export class GetProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(request: GetProjectRequest): Promise<GetProjectResponse> {
    const { projectId, userId, userRoles } = request;

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new AppException("Project not found", 404);
    }

    // Validar permisos de visualización
    if (!project.canBeViewedBy(userId, userRoles)) {
      throw new AppException(
        "Insufficient permissions to view this project",
        403
      );
    }

    return {
      project,
    };
  }
}
