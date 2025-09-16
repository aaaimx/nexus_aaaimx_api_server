import { ProcessProjectRequestUseCase } from "@/application/use-cases/project/process-project-request.use-case";
import { RequestStatus } from "@/domain/entities/project-request.entity";
import AppException from "@/shared/utils/exception.util";
import {
  createMockProject,
  createMockProjectRequest,
  createMockProjectRepository,
  createMockUserRepository,
  createMockProjectRequestRepository,
} from "../../test-helpers";

describe("ProcessProjectRequestUseCase", () => {
  let useCase: ProcessProjectRequestUseCase;
  let mockProjectRequestRepository: ReturnType<
    typeof createMockProjectRequestRepository
  >;
  let mockProjectRepository: ReturnType<typeof createMockProjectRepository>;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockProjectRequestRepository = createMockProjectRequestRepository();
    mockProjectRepository = createMockProjectRepository();
    mockUserRepository = createMockUserRepository();
    useCase = new ProcessProjectRequestUseCase(
      mockProjectRequestRepository,
      mockProjectRepository,
      mockUserRepository
    );
  });

  describe("execute", () => {
    const approveRequest = {
      requestId: "request-123",
      projectId: "project-123",
      userId: "user-123",
      userRoles: ["member"],
      status: RequestStatus.APPROVED,
      adminMessage: "Welcome to the team!",
    };

    const rejectRequest = {
      requestId: "request-123",
      projectId: "project-123",
      userId: "user-123",
      userRoles: ["member"],
      status: RequestStatus.REJECTED,
      adminMessage: "Thank you for your interest, but not at this time.",
    };

    it("should approve project request successfully", async () => {
      // Arrange
      const mockProjectRequest = createMockProjectRequest({
        id: "request-123",
        userId: "user-456",
        projectId: "project-123",
        status: RequestStatus.PENDING,
      });

      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123", // Same as requester (project creator)
      });

      const approvedRequest = createMockProjectRequest({
        ...mockProjectRequest,
        status: RequestStatus.APPROVED,
        adminMessage: "Welcome to the team!",
      });

      mockProjectRequestRepository.findById.mockResolvedValue(
        mockProjectRequest
      );
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.addMember.mockResolvedValue(true);
      mockProjectRequestRepository.update.mockResolvedValue(approvedRequest);

      // Act
      const result = await useCase.execute(approveRequest);

      // Assert
      expect(result.projectRequest).toEqual(approvedRequest);
      expect(result.memberAdded).toBe(true);
      expect(mockProjectRepository.addMember).toHaveBeenCalledWith(
        "project-123",
        "user-456"
      );
      expect(mockProjectRequestRepository.update).toHaveBeenCalledWith(
        "request-123",
        expect.objectContaining({
          status: RequestStatus.APPROVED,
          adminMessage: "Welcome to the team!",
        })
      );
    });

    it("should reject project request successfully", async () => {
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

      const rejectedRequest = createMockProjectRequest({
        ...mockProjectRequest,
        status: RequestStatus.REJECTED,
        adminMessage: "Thank you for your interest, but not at this time.",
      });

      mockProjectRequestRepository.findById.mockResolvedValue(
        mockProjectRequest
      );
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRequestRepository.update.mockResolvedValue(rejectedRequest);

      // Act
      const result = await useCase.execute(rejectRequest);

      // Assert
      expect(result.projectRequest).toEqual(rejectedRequest);
      expect(result.memberAdded).toBe(false);
      expect(mockProjectRepository.addMember).not.toHaveBeenCalled();
      expect(mockProjectRequestRepository.update).toHaveBeenCalledWith(
        "request-123",
        expect.objectContaining({
          status: RequestStatus.REJECTED,
          adminMessage: "Thank you for your interest, but not at this time.",
        })
      );
    });

    it("should throw error if request not found", async () => {
      // Arrange
      mockProjectRequestRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(approveRequest)).rejects.toThrow(
        new AppException("Project request not found with ID: request-123", 404)
      );
      expect(mockProjectRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if request belongs to different project", async () => {
      // Arrange
      const mockProjectRequest = createMockProjectRequest({
        id: "request-123",
        projectId: "different-project",
      });

      mockProjectRequestRepository.findById.mockResolvedValue(
        mockProjectRequest
      );

      // Act & Assert
      await expect(useCase.execute(approveRequest)).rejects.toThrow(
        new AppException(
          "Project request does not belong to the specified project",
          400
        )
      );
      expect(mockProjectRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if request is not pending", async () => {
      // Arrange
      const mockProjectRequest = createMockProjectRequest({
        id: "request-123",
        projectId: "project-123",
        status: RequestStatus.APPROVED, // Already processed
      });

      mockProjectRequestRepository.findById.mockResolvedValue(
        mockProjectRequest
      );

      // Act & Assert
      await expect(useCase.execute(approveRequest)).rejects.toThrow(
        new AppException(
          "Request can only be processed when in PENDING status",
          400
        )
      );
      expect(mockProjectRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if project not found", async () => {
      // Arrange
      const mockProjectRequest = createMockProjectRequest({
        id: "request-123",
        projectId: "project-123",
        status: RequestStatus.PENDING,
      });

      mockProjectRequestRepository.findById.mockResolvedValue(
        mockProjectRequest
      );
      mockProjectRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(approveRequest)).rejects.toThrow(
        new AppException("Project not found with ID: project-123", 404)
      );
    });

    it("should allow committee member to process request", async () => {
      // Arrange
      const committeeRequest = {
        ...approveRequest,
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

      const approvedRequest = createMockProjectRequest({
        ...mockProjectRequest,
        status: RequestStatus.APPROVED,
      });

      mockProjectRequestRepository.findById.mockResolvedValue(
        mockProjectRequest
      );
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.addMember.mockResolvedValue(true);
      mockProjectRequestRepository.update.mockResolvedValue(approvedRequest);

      // Act
      const result = await useCase.execute(committeeRequest);

      // Assert
      expect(result.projectRequest).toEqual(approvedRequest);
      expect(result.memberAdded).toBe(true);
    });

    it("should allow president to process request", async () => {
      // Arrange
      const presidentRequest = {
        ...approveRequest,
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

      const approvedRequest = createMockProjectRequest({
        ...mockProjectRequest,
        status: RequestStatus.APPROVED,
      });

      mockProjectRequestRepository.findById.mockResolvedValue(
        mockProjectRequest
      );
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.addMember.mockResolvedValue(true);
      mockProjectRequestRepository.update.mockResolvedValue(approvedRequest);

      // Act
      const result = await useCase.execute(presidentRequest);

      // Assert
      expect(result.projectRequest).toEqual(approvedRequest);
      expect(result.memberAdded).toBe(true);
    });

    it("should throw error for insufficient permissions", async () => {
      // Arrange
      const unauthorizedRequest = {
        ...approveRequest,
        userId: "unauthorized-user",
        userRoles: ["member"],
      };

      const mockProjectRequest = createMockProjectRequest({
        id: "request-123",
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

      // Act & Assert
      await expect(useCase.execute(unauthorizedRequest)).rejects.toThrow(
        new AppException(
          "Insufficient permissions to process project requests",
          403
        )
      );
      expect(mockProjectRepository.addMember).not.toHaveBeenCalled();
    });

    it("should throw error if adding member fails", async () => {
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
      mockProjectRepository.addMember.mockResolvedValue(false); // Failure

      // Act & Assert
      await expect(useCase.execute(approveRequest)).rejects.toThrow(
        new AppException("Failed to add user as project member", 500)
      );
      expect(mockProjectRequestRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error if update fails", async () => {
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
      mockProjectRepository.addMember.mockResolvedValue(true);
      mockProjectRequestRepository.update.mockResolvedValue(null); // Failure

      // Act & Assert
      await expect(useCase.execute(approveRequest)).rejects.toThrow(
        new AppException("Failed to update project request", 500)
      );
    });

    it("should throw error for invalid status", async () => {
      // Arrange
      const invalidRequest = {
        ...approveRequest,
        status: RequestStatus.PENDING, // Invalid for processing
      };

      const mockProjectRequest = createMockProjectRequest({
        id: "request-123",
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

      // Act & Assert
      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        new AppException(
          "Invalid status. Only APPROVED or REJECTED are allowed for processing",
          400
        )
      );
    });
  });
});
