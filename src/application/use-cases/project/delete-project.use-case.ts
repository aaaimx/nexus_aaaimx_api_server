import { IProjectRepository } from "@/domain/repositories/project.repository";
import AppException from "@/shared/utils/exception.util";

export interface DeleteProjectRequest {
  projectId: string;
  userId: string;
  userRoles: string[];
}

export interface DeleteProjectResponse {
  success: boolean;
}

export class DeleteProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(request: DeleteProjectRequest): Promise<DeleteProjectResponse> {
    const { projectId, userId, userRoles } = request;

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new AppException("Project not found", 404);
    }

    // Validar permisos de eliminación
    if (!project.canBeDeletedBy(userId, userRoles)) {
      throw new AppException(
        "Insufficient permissions to delete this project",
        403
      );
    }

    const success = await this.projectRepository.delete(projectId);
    if (!success) {
      throw new AppException("Failed to delete project", 500);
    }

    return {
      success: true,
    };
  }
}
