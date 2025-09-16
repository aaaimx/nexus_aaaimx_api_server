import { IProjectRepository } from "@/domain/repositories/project.repository";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { Project, ContentStatus } from "@/domain/entities/project.entity";
import AppException from "@/shared/utils/exception.util";

export interface CreateProjectRequest {
  name: string;
  description?: string;
  coverUrl?: string;
  isPublic: boolean;
  tagIds?: string[];
  clubIds?: string[];
  divisionIds?: string[];
  userId: string;
  userRoles: string[];
}

export interface CreateProjectResponse {
  project: Project;
}

export class CreateProjectUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(request: CreateProjectRequest): Promise<CreateProjectResponse> {
    const {
      name,
      description,
      coverUrl,
      isPublic,
      tagIds,
      clubIds,
      divisionIds,
      userId,
      userRoles,
    } = request;

    // Validar que el usuario existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppException(`User not found with ID: ${userId}`, 404);
    }

    // Validar que el nombre sea único
    const existingProject = await this.projectRepository.findByName(name);
    if (existingProject) {
      throw new AppException("Project with this name already exists", 400);
    }

    // Validar permisos de creación según el rol
    this.validateCreatePermissions(userRoles, clubIds, divisionIds);

    // Crear el proyecto
    const project = Project.create({
      name,
      description: description || undefined,
      coverUrl: coverUrl || undefined,
      status: ContentStatus.DRAFT,
      isPublic,
      userId,
      tags: tagIds || [],
      clubIds: clubIds || [],
      divisionIds: divisionIds || [],
    });

    const createdProject = await this.projectRepository.create(project);

    return {
      project: createdProject,
    };
  }

  private validateCreatePermissions(
    userRoles: string[],
    _clubIds?: string[],
    _divisionIds?: string[]
  ): void {
    // committee y president pueden crear proyectos en cualquier lugar
    if (userRoles.includes("committee") || userRoles.includes("president")) {
      return;
    }

    // leader y co-leader pueden crear proyectos en su división/club
    if (userRoles.includes("leader") || userRoles.includes("co-leader")) {
      // Esta validación se completará con la información de membresía del usuario
      // Por ahora permitimos la creación
      return;
    }

    // senior member puede crear proyectos en divisiones/clubs donde es miembro
    if (userRoles.includes("senior member")) {
      // Esta validación se completará con la información de membresía del usuario
      // Por ahora permitimos la creación
      return;
    }

    // member no puede crear proyectos
    throw new AppException("Insufficient permissions to create projects", 403);
  }
}
