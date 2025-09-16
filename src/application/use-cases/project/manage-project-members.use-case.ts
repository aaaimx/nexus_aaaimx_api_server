import { IProjectRepository } from "@/domain/repositories/project.repository";
import AppException from "@/shared/utils/exception.util";

export interface AddProjectMemberRequest {
  projectId: string;
  userId: string;
  userRoles: string[];
  memberId: string;
}

export interface RemoveProjectMemberRequest {
  projectId: string;
  userId: string;
  userRoles: string[];
  memberId: string;
}

export interface GetProjectMembersRequest {
  projectId: string;
  userId: string;
  userRoles: string[];
}

export interface AddProjectMemberResponse {
  success: boolean;
}

export interface RemoveProjectMemberResponse {
  success: boolean;
}

export interface GetProjectMembersResponse {
  memberIds: string[];
}

export class ManageProjectMembersUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async addMember(
    request: AddProjectMemberRequest
  ): Promise<AddProjectMemberResponse> {
    const { projectId, userId, userRoles, memberId } = request;

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new AppException("Project not found", 404);
    }

    // Validar permisos de gestión de miembros
    if (!project.canManageMembersBy(userId, userRoles)) {
      throw new AppException(
        "Insufficient permissions to manage project members",
        403
      );
    }

    // Verificar que el usuario no sea ya miembro
    const isAlreadyMember = await this.projectRepository.isMember(
      projectId,
      memberId
    );
    if (isAlreadyMember) {
      throw new AppException("User is already a member of this project", 400);
    }

    const success = await this.projectRepository.addMember(projectId, memberId);
    if (!success) {
      throw new AppException("Failed to add member to project", 500);
    }

    return {
      success: true,
    };
  }

  async removeMember(
    request: RemoveProjectMemberRequest
  ): Promise<RemoveProjectMemberResponse> {
    const { projectId, userId, userRoles, memberId } = request;

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new AppException("Project not found", 404);
    }

    // Validar permisos de gestión de miembros
    if (!project.canManageMembersBy(userId, userRoles)) {
      throw new AppException(
        "Insufficient permissions to manage project members",
        403
      );
    }

    // Verificar que el usuario sea miembro
    const isMember = await this.projectRepository.isMember(projectId, memberId);
    if (!isMember) {
      throw new AppException("User is not a member of this project", 400);
    }

    const success = await this.projectRepository.removeMember(
      projectId,
      memberId
    );
    if (!success) {
      throw new AppException("Failed to remove member from project", 500);
    }

    return {
      success: true,
    };
  }

  async getMembers(
    request: GetProjectMembersRequest
  ): Promise<GetProjectMembersResponse> {
    const { projectId, userId, userRoles } = request;

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new AppException("Project not found", 404);
    }

    // Validar permisos de visualización
    if (!project.canBeViewedBy(userId, userRoles)) {
      throw new AppException(
        "Insufficient permissions to view project members",
        403
      );
    }

    const memberIds = await this.projectRepository.getMembers(projectId);

    return {
      memberIds,
    };
  }
}
