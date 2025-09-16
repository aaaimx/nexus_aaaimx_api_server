import {
  IProjectRepository,
  ProjectFilters,
} from "@/domain/repositories/project.repository";
import { Project, ContentStatus } from "@/domain/entities/project.entity";

export interface ListProjectsRequest {
  userId: string;
  userRoles: string[];
  filters?: {
    status?: ContentStatus;
    isPublic?: boolean;
    clubId?: string;
    divisionId?: string;
    tagId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  };
}

export interface ListProjectsResponse {
  projects: Project[];
  total: number;
  limit: number;
  offset: number;
}

export class ListProjectsUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(request: ListProjectsRequest): Promise<ListProjectsResponse> {
    const { userId, userRoles, filters = {} } = request;

    // Construir filtros basados en permisos del usuario
    const projectFilters: ProjectFilters = {
      ...filters,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
    };

    // Aplicar filtros de visibilidad según el rol
    this.applyVisibilityFilters(projectFilters, userRoles);

    const projects = await this.projectRepository.findAll(projectFilters);

    // Filtrar proyectos que el usuario puede ver
    const visibleProjects = projects.filter((project) =>
      project.canBeViewedBy(userId, userRoles)
    );

    return {
      projects: visibleProjects,
      total: visibleProjects.length,
      limit: projectFilters.limit || 20,
      offset: projectFilters.offset || 0,
    };
  }

  private applyVisibilityFilters(
    _filters: ProjectFilters,
    userRoles: string[]
  ): void {
    // committee y president pueden ver todos los proyectos
    if (userRoles.includes("committee") || userRoles.includes("president")) {
      return;
    }

    // Otros roles solo pueden ver proyectos públicos, internos o donde son miembros
    // Esta lógica se implementará con filtros más específicos según la membresía del usuario
  }
}
