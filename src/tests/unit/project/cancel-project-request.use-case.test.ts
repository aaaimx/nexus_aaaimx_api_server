import { CancelProjectRequestUseCase } from "@/application/use-cases/project/cancel-project-request.use-case";
import { RequestStatus } from "@/domain/entities/project-request.entity";
import AppException from "@/shared/utils/exception.util";
import {
  createMockProject,
  createMockProjectRequest,
  createMockProjectRepository,
  createMockUserRepository,
  createMockProjectRequestRepository,
} from "../../test-helpers";

describe("CancelProjectRequestUseCase", () => {
  let useCase: CancelProjectRequestUseCase;
  let mockProjectRequestRepository: ReturnType<
    typeof createMockProjectRequestRepository
  >;
  let mockProjectRepository: ReturnType<typeof createMockProjectRepository>;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockProjectRequestRepository = createMockProjectRequestRepository();
    mockProjectRepository = createMockProjectRepository();
    mockUserRepository = createMockUserRepository();
    useCase = new CancelProjectRequestUseCase(
      mockProjectRequestRepository,
      mockProjectRepository,
      mockUserRepository
    );
  });

  describe("execute", () => {
    const validRequest = {
      requestId: "request-123",
      projectId: "project-123",
      userId: "user-456",
      userRoles: ["member"],
    };

    it("should cancel project request successfully for request owner", async () => {
      // Arrange
      const mockProjectRequest = createMockProjectRequest({
        id: "request-123",
        userId: "user-456", // Same as requester
        projectId: "project-123",
        status: RequestStatus.PENDING,
      });

      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123",
      });

      mockProjectRequestRepository.findById.mockResolvedValue(
        mockProjectRequest
      );
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRequestRepository.delete.mockResolvedValue(true);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(mockProjectRequestRepository.findById).toHaveBeenCalledWith(
        "request-123"
      );
      expect(mockProjectRepository.findById).toHaveBeenCalledWith(
        "project-123"
      );
      expect(mockProjectRequestRepository.delete).toHaveBeenCalledWith(
        "request-123"
      );
    });

    it("should allow project creator to cancel any request", async () => {
      // Arrange
      const creatorRequest = {
        ...validRequest,
        userId: "user-123", // Project creator
      };

      const mockProjectRequest = createMockProjectRequest({
        id: "request-123",
        userId: "user-456", // Different from requester
        projectId: "project-123",
        status: RequestStatus.PENDING,
      });

      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123", // Same as requester
      });

      mockProjectRequestRepository.findById.mockResolvedValue(
        mockProjectRequest
      );
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRequestRepository.delete.mockResolvedValue(true);

      // Act
      const result = await useCase.execute(creatorRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(mockProjectRequestRepository.delete).toHaveBeenCalledWith(
        "request-123"
      );
    });

    it("should allow committee member to cancel any request", async () => {
      // Arrange
      const committeeRequest = {
        ...validRequest,
        userId: "committee-user",
        userRoles: ["committee"],
      };

      const mockProjectRequest = createMockProjectRequest({
        id: "request-123",
        userId: "user-456",
        projectId: "project-123",
        status: RequestStatus.PENDING,
      });

      const mockProject = createMockProject({
        id: "project-123",
        userId: "original-creator",
      });

      mockProjectRequestRepository.findById.mockResolvedValue(
        mockProjectRequest
      );
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRequestRepository.delete.mockResolvedValue(true);

      // Act
      const result = await useCase.execute(committeeRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(mockProjectRequestRepository.delete).toHaveBeenCalledWith(
        "request-123"
      );
    });

    it("should allow president to cancel any request", async () => {
      // Arrange
      const presidentRequest = {
        ...validRequest,
        userId: "president-user",
        userRoles: ["president"],
      };

      const mockProjectRequest = createMockProjectRequest({
        id: "request-123",
        userId: "user-456",
        projectId: "project-123",
        status: RequestStatus.PENDING,
      });

      const mockProject = createMockProject({
        id: "project-123",
        userId: "original-creator",
      });

      mockProjectRequestRepository.findById.mockResolvedValue(
        mockProjectRequest
      );
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRequestRepository.delete.mockResolvedValue(true);

      // Act
      const result = await useCase.execute(presidentRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(mockProjectRequestRepository.delete).toHaveBeenCalledWith(
        "request-123"
      );
    });

    it("should throw error if request not found", async () => {
      // Arrange
      mockProjectRequestRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new AppException("Project request not found with ID: request-123", 404)
      );
      expect(mockProjectRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if request belongs to different project", async () => {
      // Arrange
      const mockProjectRequest = createMockProjectRequest({
        id: "request-123",
        userId: "user-456",
        projectId: "different-project",
        status: RequestStatus.PENDING,
      });

      mockProjectRequestRepository.findById.mockResolvedValue(
        mockProjectRequest
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new AppException(
          "Project request does not belong to the specified project",
          400
        )
      );
      expect(mockProjectRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if project not found", async () => {
      // Arrange
      const mockProjectRequest = createMockProjectRequest({
        id: "request-123",
        userId: "user-456",
        projectId: "project-123",
        status: RequestStatus.PENDING,
      });

      mockProjectRequestRepository.findById.mockResolvedValue(
        mockProjectRequest
      );
      mockProjectRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new AppException("Project not found with ID: project-123", 404)
      );
      expect(mockProjectRequestRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error for insufficient permissions", async () => {
      // Arrange
      const unauthorizedRequest = {
        ...validRequest,
        userId: "unauthorized-user",
        userRoles: ["member"],
      };

      const mockProjectRequest = createMockProjectRequest({
        id: "request-123",
        userId: "user-456", // Different from requester
        projectId: "project-123",
        status: RequestStatus.PENDING,
      });

      const mockProject = createMockProject({
        id: "project-123",
        userId: "original-creator", // Different from requester
      });

      mockProjectRequestRepository.findById.mockResolvedValue(
        mockProjectRequest
      );
      mockProjectRepository.findById.mockResolvedValue(mockProject);

      // Act & Assert
      await expect(useCase.execute(unauthorizedRequest)).rejects.toThrow(
        new AppException(
          "Insufficient permissions to cancel this project request",
          403
        )
      );
      expect(mockProjectRequestRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error if deletion fails", async () => {
      // Arrange
      const mockProjectRequest = createMockProjectRequest({
        id: "request-123",
        userId: "user-456",
        projectId: "project-123",
        status: RequestStatus.PENDING,
      });

      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123",
      });

      mockProjectRequestRepository.findById.mockResolvedValue(
        mockProjectRequest
      );
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRequestRepository.delete.mockResolvedValue(false); // Failure

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new AppException("Failed to cancel project request", 500)
      );
    });

    it("should handle approved requests cancellation", async () => {
      // Arrange
      const mockProjectRequest = createMockProjectRequest({
        id: "request-123",
        userId: "user-456",
        projectId: "project-123",
        status: RequestStatus.APPROVED,
      });

      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123",
      });

      const creatorRequest = {
        ...validRequest,
        userId: "user-123", // Project creator
      };

      mockProjectRequestRepository.findById.mockResolvedValue(
        mockProjectRequest
      );
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRequestRepository.delete.mockResolvedValue(true);

      // Act
      const result = await useCase.execute(creatorRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(mockProjectRequestRepository.delete).toHaveBeenCalledWith(
        "request-123"
      );
    });

    it("should handle rejected requests cancellation", async () => {
      // Arrange
      const mockProjectRequest = createMockProjectRequest({
        id: "request-123",
        userId: "user-456",
        projectId: "project-123",
        status: RequestStatus.REJECTED,
      });

      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123",
      });

      const creatorRequest = {
        ...validRequest,
        userId: "user-123", // Project creator
      };

      mockProjectRequestRepository.findById.mockResolvedValue(
        mockProjectRequest
      );
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRequestRepository.delete.mockResolvedValue(true);

      // Act
      const result = await useCase.execute(creatorRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(mockProjectRequestRepository.delete).toHaveBeenCalledWith(
        "request-123"
      );
    });

    it("should handle repository errors gracefully", async () => {
      // Arrange
      const mockProjectRequest = createMockProjectRequest({
        id: "request-123",
        userId: "user-456",
        projectId: "project-123",
        status: RequestStatus.PENDING,
      });

      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123",
      });

      mockProjectRequestRepository.findById.mockResolvedValue(
        mockProjectRequest
      );
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRequestRepository.delete.mockRejectedValue(
        new Error("Database error")
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        "Database error"
      );
    });
  });
});
