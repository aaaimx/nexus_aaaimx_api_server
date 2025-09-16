import { Request, Response } from "express";
import { IProjectRepository } from "@/domain/repositories/project.repository";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { IProjectRequestRepository } from "@/domain/repositories/project-request.repository";
import { CreateProjectUseCase } from "@/application/use-cases/project/create-project.use-case";
import { GetProjectUseCase } from "@/application/use-cases/project/get-project.use-case";
import { ListProjectsUseCase } from "@/application/use-cases/project/list-projects.use-case";
import { UpdateProjectUseCase } from "@/application/use-cases/project/update-project.use-case";
import { DeleteProjectUseCase } from "@/application/use-cases/project/delete-project.use-case";
import { ManageProjectMembersUseCase } from "@/application/use-cases/project/manage-project-members.use-case";
import { CreateProjectRequestUseCase } from "@/application/use-cases/project/create-project-request.use-case";
import { ListProjectRequestsUseCase } from "@/application/use-cases/project/list-project-requests.use-case";
import { ProcessProjectRequestUseCase } from "@/application/use-cases/project/process-project-request.use-case";
import { CancelProjectRequestUseCase } from "@/application/use-cases/project/cancel-project-request.use-case";
// Import types are handled inline
import ApiResponseUtil from "@/shared/utils/api-response.util";
import AppException from "@/shared/utils/exception.util";

export class ProjectController {
  private createProjectUseCase: CreateProjectUseCase;
  private getProjectUseCase: GetProjectUseCase;
  private listProjectsUseCase: ListProjectsUseCase;
  private updateProjectUseCase: UpdateProjectUseCase;
  private deleteProjectUseCase: DeleteProjectUseCase;
  private manageProjectMembersUseCase: ManageProjectMembersUseCase;
  private createProjectRequestUseCase: CreateProjectRequestUseCase;
  private listProjectRequestsUseCase: ListProjectRequestsUseCase;
  private processProjectRequestUseCase: ProcessProjectRequestUseCase;
  private cancelProjectRequestUseCase: CancelProjectRequestUseCase;

  constructor(
    private readonly _projectRepository: IProjectRepository,
    private readonly _userRepository: IUserRepository,
    private readonly _projectRequestRepository: IProjectRequestRepository
  ) {
    this.createProjectUseCase = new CreateProjectUseCase(
      this._projectRepository,
      this._userRepository
    );
    this.getProjectUseCase = new GetProjectUseCase(this._projectRepository);
    this.listProjectsUseCase = new ListProjectsUseCase(this._projectRepository);
    this.updateProjectUseCase = new UpdateProjectUseCase(
      this._projectRepository
    );
    this.deleteProjectUseCase = new DeleteProjectUseCase(
      this._projectRepository
    );
    this.manageProjectMembersUseCase = new ManageProjectMembersUseCase(
      this._projectRepository
    );
    this.createProjectRequestUseCase = new CreateProjectRequestUseCase(
      this._projectRequestRepository,
      this._projectRepository,
      this._userRepository
    );
    this.listProjectRequestsUseCase = new ListProjectRequestsUseCase(
      this._projectRequestRepository,
      this._projectRepository
    );
    this.processProjectRequestUseCase = new ProcessProjectRequestUseCase(
      this._projectRequestRepository,
      this._projectRepository
    );
    this.cancelProjectRequestUseCase = new CancelProjectRequestUseCase(
      this._projectRequestRepository,
      this._projectRepository
    );
  }

  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRoles = (req.user as any)?.roles || [];

      if (!userId) {
        throw new AppException("User not authenticated", 401);
      }

      const request = {
        ...req.body,
        userId,
        userRoles,
      };

      const result = await this.createProjectUseCase.execute(request);

      ApiResponseUtil.success(
        res,
        result.project,
        "Project created successfully",
        201
      );
    } catch (error) {
      ApiResponseUtil.error(res, error);
    }
  }

  async getProject(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRoles = (req.user as any)?.roles || [];
      const projectId = req.params["id"];

      if (!userId) {
        throw new AppException("User not authenticated", 401);
      }

      if (!projectId) {
        throw new AppException("Project ID is required", 400);
      }

      const result = await this.getProjectUseCase.execute({
        projectId,
        userId,
        userRoles,
      });

      ApiResponseUtil.success(
        res,
        result.project,
        "Project retrieved successfully",
        200
      );
    } catch (error) {
      ApiResponseUtil.error(res, error);
    }
  }

  async listProjects(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRoles = (req.user as any)?.roles || [];

      if (!userId) {
        throw new AppException("User not authenticated", 401);
      }

      const request = {
        userId,
        userRoles,
        filters: req.query,
      };

      const result = await this.listProjectsUseCase.execute(request);

      ApiResponseUtil.success(
        res,
        {
          projects: result.projects,
          pagination: {
            total: result.total,
            limit: result.limit,
            offset: result.offset,
          },
        },
        "Projects retrieved successfully",
        200
      );
    } catch (error) {
      ApiResponseUtil.error(res, error);
    }
  }

  async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRoles = (req.user as any)?.roles || [];
      const projectId = req.params["id"];

      if (!userId) {
        throw new AppException("User not authenticated", 401);
      }

      const request = {
        projectId,
        userId,
        userRoles,
        data: req.body,
      };

      if (!projectId) {
        throw new AppException("Project ID is required", 400);
      }

      const result = await this.updateProjectUseCase.execute(request as any);

      ApiResponseUtil.success(
        res,
        result.project,
        "Project updated successfully",
        200
      );
    } catch (error) {
      ApiResponseUtil.error(res, error);
    }
  }

  async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRoles = (req.user as any)?.roles || [];
      const projectId = req.params["id"];

      if (!userId) {
        throw new AppException("User not authenticated", 401);
      }

      if (!projectId) {
        throw new AppException("Project ID is required", 400);
      }

      const result = await this.deleteProjectUseCase.execute({
        projectId,
        userId,
        userRoles,
      });

      ApiResponseUtil.success(res, result, "Project deleted successfully", 200);
    } catch (error) {
      ApiResponseUtil.error(res, error);
    }
  }

  async addProjectMember(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRoles = (req.user as any)?.roles || [];
      const projectId = req.params["id"];
      const memberId = req.body.memberId;

      if (!userId) {
        throw new AppException("User not authenticated", 401);
      }

      if (!projectId) {
        throw new AppException("Project ID is required", 400);
      }
      if (!memberId) {
        throw new AppException("Member ID is required", 400);
      }

      const result = await this.manageProjectMembersUseCase.addMember({
        projectId,
        userId,
        userRoles,
        memberId,
      });

      ApiResponseUtil.success(
        res,
        result,
        "Member added to project successfully",
        200
      );
    } catch (error) {
      ApiResponseUtil.error(res, error);
    }
  }

  async removeProjectMember(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRoles = (req.user as any)?.roles || [];
      const projectId = req.params["id"];
      const memberId = req.params["memberId"];

      if (!userId) {
        throw new AppException("User not authenticated", 401);
      }

      if (!projectId) {
        throw new AppException("Project ID is required", 400);
      }
      if (!memberId) {
        throw new AppException("Member ID is required", 400);
      }

      const result = await this.manageProjectMembersUseCase.removeMember({
        projectId,
        userId,
        userRoles,
        memberId,
      });

      ApiResponseUtil.success(
        res,
        result,
        "Member removed from project successfully",
        200
      );
    } catch (error) {
      ApiResponseUtil.error(res, error);
    }
  }

  async getProjectMembers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRoles = (req.user as any)?.roles || [];
      const projectId = req.params["id"];

      if (!userId) {
        throw new AppException("User not authenticated", 401);
      }

      if (!projectId) {
        throw new AppException("Project ID is required", 400);
      }

      const result = await this.manageProjectMembersUseCase.getMembers({
        projectId,
        userId,
        userRoles,
      });

      ApiResponseUtil.success(
        res,
        { memberIds: result.memberIds },
        "Project members retrieved successfully",
        200
      );
    } catch (error) {
      ApiResponseUtil.error(res, error);
    }
  }

  // ============================================
  // Project Request Methods
  // ============================================

  async createProjectRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const projectId = req.params["id"];
      const { message } = req.body;

      if (!userId) {
        throw new AppException("User not authenticated", 401);
      }

      if (!projectId) {
        throw new AppException("Project ID is required", 400);
      }

      const result = await this.createProjectRequestUseCase.execute({
        userId,
        projectId,
        message,
      });

      ApiResponseUtil.success(
        res,
        result.projectRequest,
        "Project request created successfully",
        201
      );
    } catch (error) {
      ApiResponseUtil.error(res, error);
    }
  }

  async listProjectRequests(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRoles = (req.user as any)?.roles || [];
      const projectId = req.params["id"];
      const { status } = req.query;

      if (!userId) {
        throw new AppException("User not authenticated", 401);
      }

      if (!projectId) {
        throw new AppException("Project ID is required", 400);
      }

      const result = await this.listProjectRequestsUseCase.execute({
        projectId,
        userId,
        userRoles,
        status: status as any,
      });

      ApiResponseUtil.success(
        res,
        {
          projectRequests: result.projectRequests,
          total: result.total,
        },
        "Project requests retrieved successfully",
        200
      );
    } catch (error) {
      ApiResponseUtil.error(res, error);
    }
  }

  async processProjectRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRoles = (req.user as any)?.roles || [];
      const projectId = req.params["id"];
      const requestId = req.params["requestId"];
      const { status, adminMessage } = req.body;

      if (!userId) {
        throw new AppException("User not authenticated", 401);
      }

      if (!projectId) {
        throw new AppException("Project ID is required", 400);
      }
      if (!requestId) {
        throw new AppException("Request ID is required", 400);
      }

      const result = await this.processProjectRequestUseCase.execute({
        requestId,
        projectId,
        userId,
        userRoles,
        status,
        adminMessage,
      });

      ApiResponseUtil.success(
        res,
        {
          projectRequest: result.projectRequest,
          memberAdded: result.memberAdded,
        },
        `Project request ${status.toLowerCase()}d successfully`,
        200
      );
    } catch (error) {
      ApiResponseUtil.error(res, error);
    }
  }

  async cancelProjectRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRoles = (req.user as any)?.roles || [];
      const projectId = req.params["id"];
      const requestId = req.params["requestId"];

      if (!userId) {
        throw new AppException("User not authenticated", 401);
      }

      if (!projectId) {
        throw new AppException("Project ID is required", 400);
      }
      if (!requestId) {
        throw new AppException("Request ID is required", 400);
      }

      const result = await this.cancelProjectRequestUseCase.execute({
        requestId,
        projectId,
        userId,
        userRoles,
      });

      ApiResponseUtil.success(
        res,
        { success: result.success },
        "Project request cancelled successfully",
        200
      );
    } catch (error) {
      ApiResponseUtil.error(res, error);
    }
  }
}
