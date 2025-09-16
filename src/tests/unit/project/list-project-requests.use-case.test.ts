import { ListProjectRequestsUseCase } from "@/application/use-cases/project/list-project-requests.use-case";
import { RequestStatus } from "@/domain/entities/project-request.entity";
import AppException from "@/shared/utils/exception.util";
import {
  createMockProject,
  createMockProjectRequest,
  createMockProjectRepository,
  createMockUserRepository,
  createMockProjectRequestRepository,
} from "../../test-helpers";

describe("ListProjectRequestsUseCase", () => {
  let useCase: ListProjectRequestsUseCase;
  let mockProjectRequestRepository: ReturnType<
    typeof createMockProjectRequestRepository
  >;
  let mockProjectRepository: ReturnType<typeof createMockProjectRepository>;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockProjectRequestRepository = createMockProjectRequestRepository();
    mockProjectRepository = createMockProjectRepository();
    mockUserRepository = createMockUserRepository();
    useCase = new ListProjectRequestsUseCase(
      mockProjectRequestRepository,
      mockProjectRepository,
      mockUserRepository
    );
  });

  describe("execute", () => {
    const validRequest = {
      projectId: "project-123",
      userId: "user-123",
      userRoles: ["member"],
    };

    it("should list project requests successfully for project creator", async () => {
      // Arrange
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123", // Same as requester
      });

      const mockRequests = [
        createMockProjectRequest({
          id: "request-1",
          userId: "user-456",
          projectId: "project-123",
          status: RequestStatus.PENDING,
        }),
        createMockProjectRequest({
          id: "request-2",
          userId: "user-789",
          projectId: "project-123",
          status: RequestStatus.APPROVED,
        }),
      ];

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRequestRepository.findByProject.mockResolvedValue(
        mockRequests
      );

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.projectRequests).toEqual(mockRequests);
      expect(result.total).toBe(2);
      expect(mockProjectRepository.findById).toHaveBeenCalledWith(
        "project-123"
      );
      expect(mockProjectRequestRepository.findByProject).toHaveBeenCalledWith(
        "project-123",
        undefined
      );
    });

    it("should filter requests by status", async () => {
      // Arrange
      const requestWithStatus = {
        ...validRequest,
        status: RequestStatus.PENDING,
      };

      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123",
      });

      const mockRequests = [
        createMockProjectRequest({
          id: "request-1",
          status: RequestStatus.PENDING,
        }),
      ];

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRequestRepository.findByProject.mockResolvedValue(
        mockRequests
      );

      // Act
      const result = await useCase.execute(requestWithStatus);

      // Assert
      expect(result.projectRequests).toEqual(mockRequests);
      expect(mockProjectRequestRepository.findByProject).toHaveBeenCalledWith(
        "project-123",
        RequestStatus.PENDING
      );
    });

    it("should throw error if project not found", async () => {
      // Arrange
      mockProjectRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new AppException("Project not found with ID: project-123", 404)
      );
      expect(mockProjectRequestRepository.findByProject).not.toHaveBeenCalled();
    });

    it("should allow committee member to view requests", async () => {
      // Arrange
      const committeeRequest = {
        ...validRequest,
        userId: "different-user",
        userRoles: ["committee"],
      };

      const mockProject = createMockProject({
        id: "project-123",
        userId: "original-creator",
      });

      const mockRequests = [
        createMockProjectRequest({
          id: "request-1",
          projectId: "project-123",
        }),
      ];

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRequestRepository.findByProject.mockResolvedValue(
        mockRequests
      );

      // Act
      const result = await useCase.execute(committeeRequest);

      // Assert
      expect(result.projectRequests).toEqual(mockRequests);
      expect(result.total).toBe(1);
    });

    it("should allow president to view requests", async () => {
      // Arrange
      const presidentRequest = {
        ...validRequest,
        userId: "different-user",
        userRoles: ["president"],
      };

      const mockProject = createMockProject({
        id: "project-123",
        userId: "original-creator",
      });

      const mockRequests = [
        createMockProjectRequest({
          id: "request-1",
          projectId: "project-123",
        }),
      ];

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRequestRepository.findByProject.mockResolvedValue(
        mockRequests
      );

      // Act
      const result = await useCase.execute(presidentRequest);

      // Assert
      expect(result.projectRequests).toEqual(mockRequests);
      expect(result.total).toBe(1);
    });

    it("should allow leader to view requests", async () => {
      // Arrange
      const leaderRequest = {
        ...validRequest,
        userId: "leader-user",
        userRoles: ["leader"],
      };

      const mockProject = createMockProject({
        id: "project-123",
        userId: "original-creator",
      });

      const mockRequests = [
        createMockProjectRequest({
          id: "request-1",
          projectId: "project-123",
        }),
      ];

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRequestRepository.findByProject.mockResolvedValue(
        mockRequests
      );

      // Act
      const result = await useCase.execute(leaderRequest);

      // Assert
      expect(result.projectRequests).toEqual(mockRequests);
      expect(result.total).toBe(1);
    });

    it("should allow co-leader to view requests", async () => {
      // Arrange
      const coLeaderRequest = {
        ...validRequest,
        userId: "co-leader-user",
        userRoles: ["co-leader"],
      };

      const mockProject = createMockProject({
        id: "project-123",
        userId: "original-creator",
      });

      const mockRequests = [
        createMockProjectRequest({
          id: "request-1",
          projectId: "project-123",
        }),
      ];

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRequestRepository.findByProject.mockResolvedValue(
        mockRequests
      );

      // Act
      const result = await useCase.execute(coLeaderRequest);

      // Assert
      expect(result.projectRequests).toEqual(mockRequests);
      expect(result.total).toBe(1);
    });

    it("should throw error for insufficient permissions", async () => {
      // Arrange
      const unauthorizedRequest = {
        ...validRequest,
        userId: "unauthorized-user",
        userRoles: ["member"],
      };

      const mockProject = createMockProject({
        id: "project-123",
        userId: "original-creator",
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);

      // Act & Assert
      await expect(useCase.execute(unauthorizedRequest)).rejects.toThrow(
        new AppException(
          "Insufficient permissions to view project requests",
          403
        )
      );
      expect(mockProjectRequestRepository.findByProject).not.toHaveBeenCalled();
    });

    it("should return empty list when no requests found", async () => {
      // Arrange
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123",
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRequestRepository.findByProject.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.projectRequests).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("should handle repository errors gracefully", async () => {
      // Arrange
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123",
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRequestRepository.findByProject.mockRejectedValue(
        new Error("Database error")
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        "Database error"
      );
    });
  });
});
