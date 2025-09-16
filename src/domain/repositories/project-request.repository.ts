import {
  ProjectRequest,
  RequestStatus,
} from "../entities/project-request.entity";

export interface IProjectRequestRepository {
  create(projectRequest: ProjectRequest): Promise<ProjectRequest>;
  findById(id: string): Promise<ProjectRequest | null>;
  findByUserAndProject(
    userId: string,
    projectId: string
  ): Promise<ProjectRequest | null>;
  findByProject(
    projectId: string,
    status?: RequestStatus
  ): Promise<ProjectRequest[]>;
  findByUser(userId: string, status?: RequestStatus): Promise<ProjectRequest[]>;
  update(
    id: string,
    data: Partial<ProjectRequest>
  ): Promise<ProjectRequest | null>;
  delete(id: string): Promise<boolean>;
  existsByUserAndProject(userId: string, projectId: string): Promise<boolean>;
}

export interface ProjectRequestFilters {
  projectId?: string;
  userId?: string;
  status?: RequestStatus;
  limit?: number;
  offset?: number;
}
