import { PrismaClient } from "@prisma/client";
import { IProjectRequestRepository } from "@/domain/repositories/project-request.repository";
import {
  ProjectRequest,
  RequestStatus,
} from "@/domain/entities/project-request.entity";

export class ProjectRequestRepository implements IProjectRequestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(projectRequest: ProjectRequest): Promise<ProjectRequest> {
    // Validate that the user and project exist
    const userExists = await this.prisma.users.findUnique({
      where: { id: projectRequest.userId },
    });
    if (!userExists) {
      throw new Error(`User with ID ${projectRequest.userId} not found`);
    }

    const projectExists = await this.prisma.projects.findUnique({
      where: { id: projectRequest.projectId },
    });
    if (!projectExists) {
      throw new Error(`Project with ID ${projectRequest.projectId} not found`);
    }

    const created = await this.prisma.project_requests.create({
      data: {
        id: projectRequest.id,
        user_id: projectRequest.userId,
        project_id: projectRequest.projectId,
        status: projectRequest.status as any,
        message: projectRequest.message || null,
        admin_message: projectRequest.adminMessage || null,
        created_at: projectRequest.createdAt,
        updated_at: projectRequest.updatedAt,
      },
      include: {
        user: true,
        project: true,
      },
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<ProjectRequest | null> {
    const projectRequest = await this.prisma.project_requests.findUnique({
      where: { id },
      include: {
        user: true,
        project: true,
      },
    });

    return projectRequest ? this.mapToEntity(projectRequest) : null;
  }

  async findByUserAndProject(
    userId: string,
    projectId: string
  ): Promise<ProjectRequest | null> {
    const projectRequest = await this.prisma.project_requests.findUnique({
      where: {
        user_id_project_id: {
          user_id: userId,
          project_id: projectId,
        },
      },
      include: {
        user: true,
        project: true,
      },
    });

    return projectRequest ? this.mapToEntity(projectRequest) : null;
  }

  async findByProject(
    projectId: string,
    status?: RequestStatus
  ): Promise<ProjectRequest[]> {
    const where: any = { project_id: projectId };
    if (status) {
      where.status = status;
    }

    const projectRequests = await this.prisma.project_requests.findMany({
      where,
      include: {
        user: true,
        project: true,
      },
      orderBy: { created_at: "desc" },
    });

    return projectRequests.map((pr) => this.mapToEntity(pr));
  }

  async findByUser(
    userId: string,
    status?: RequestStatus
  ): Promise<ProjectRequest[]> {
    const where: any = { user_id: userId };
    if (status) {
      where.status = status;
    }

    const projectRequests = await this.prisma.project_requests.findMany({
      where,
      include: {
        user: true,
        project: true,
      },
      orderBy: { created_at: "desc" },
    });

    return projectRequests.map((pr) => this.mapToEntity(pr));
  }

  async update(
    id: string,
    data: Partial<ProjectRequest>
  ): Promise<ProjectRequest | null> {
    const updateData: any = {};

    if (data.status !== undefined) updateData.status = data.status as any;
    if (data.message !== undefined) updateData.message = data.message;
    if (data.adminMessage !== undefined)
      updateData.admin_message = data.adminMessage;
    updateData.updated_at = new Date();

    const updated = await this.prisma.project_requests.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        project: true,
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.project_requests.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async existsByUserAndProject(
    userId: string,
    projectId: string
  ): Promise<boolean> {
    const request = await this.prisma.project_requests.findUnique({
      where: {
        user_id_project_id: {
          user_id: userId,
          project_id: projectId,
        },
      },
    });

    return !!request;
  }

  private mapToEntity(projectRequest: any): ProjectRequest {
    return new ProjectRequest(
      projectRequest.id,
      projectRequest.user_id,
      projectRequest.project_id,
      projectRequest.status as RequestStatus,
      projectRequest.message,
      projectRequest.admin_message,
      projectRequest.created_at,
      projectRequest.updated_at
    );
  }
}
