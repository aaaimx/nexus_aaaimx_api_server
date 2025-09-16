import { IProjectRequestRepository } from "@/domain/repositories/project-request.repository";
import { IProjectRepository } from "@/domain/repositories/project.repository";
import { IUserRepository } from "@/domain/repositories/user.repository";
import {
  ProjectRequest,
  RequestStatus,
} from "@/domain/entities/project-request.entity";
import AppException from "@/shared/utils/exception.util";

export interface CreateProjectRequestInput {
  userId: string;
  projectId: string;
  message?: string;
}

export interface CreateProjectRequestOutput {
  projectRequest: ProjectRequest;
}

export class CreateProjectRequestUseCase {
  constructor(
    private readonly projectRequestRepository: IProjectRequestRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(
    request: CreateProjectRequestInput
  ): Promise<CreateProjectRequestOutput> {
    const { userId, projectId, message } = request;

    // Validar que el usuario existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppException(`User not found with ID: ${userId}`, 404);
    }

    // Validar que el proyecto existe
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new AppException(`Project not found with ID: ${projectId}`, 404);
    }

    // Validar que el usuario no sea el creador del proyecto
    if (project.userId === userId) {
      throw new AppException(
        "Project creators cannot request to join their own projects",
        400
      );
    }

    // Validar que el usuario no sea ya miembro del proyecto
    const isMember = await this.projectRepository.isMember(projectId, userId);
    if (isMember) {
      throw new AppException("User is already a member of this project", 400);
    }

    // Validar que no exista ya una solicitud
    const existingRequest =
      await this.projectRequestRepository.existsByUserAndProject(
        userId,
        projectId
      );
    if (existingRequest) {
      throw new AppException(
        "A request to join this project already exists",
        400
      );
    }

    // Crear la solicitud
    const projectRequest = ProjectRequest.create({
      userId,
      projectId,
      status: RequestStatus.PENDING,
      message: message || undefined,
    });

    const createdRequest = await this.projectRequestRepository.create(
      projectRequest
    );

    return {
      projectRequest: createdRequest,
    };
  }
}
