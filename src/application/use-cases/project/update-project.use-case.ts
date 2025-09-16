import { IProjectRepository } from "@/domain/repositories/project.repository";
import { Project, ContentStatus } from "@/domain/entities/project.entity";
import AppException from "@/shared/utils/exception.util";

export interface UpdateProjectRequest {
  projectId: string;
  userId: string;
  userRoles: string[];
  data: {
    name?: string;
    description?: string;
    coverUrl?: string;
    status?: ContentStatus;
    isPublic?: boolean;
    tagIds?: string[];
    clubIds?: string[];
    divisionIds?: string[];
  };
}

export interface UpdateProjectResponse {
  project: Project;
}

export class UpdateProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(request: UpdateProjectRequest): Promise<UpdateProjectResponse> {
    const { projectId, userId, userRoles, data } = request;

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new AppException("Project not found", 404);
    }

    // Validar permisos de edición
    if (!project.canBeEditedBy(userId, userRoles)) {
      throw new AppException(
        "Insufficient permissions to edit this project",
        403
      );
    }

    // Validar que el nombre sea único si se está cambiando
    if (data.name && data.name !== project.name) {
      const existingProject = await this.projectRepository.findByName(
        data.name
      );
      if (existingProject) {
        throw new AppException("Project with this name already exists", 400);
      }
    }

    // Actualizar el proyecto
    const updatedProject = await this.projectRepository.update(projectId, data);
    if (!updatedProject) {
      throw new AppException("Failed to update project", 500);
    }

    return {
      project: updatedProject,
    };
  }
}
