import { CreateProjectRequestUseCase } from "@/application/use-cases/project/create-project-request.use-case";
import { RequestStatus } from "@/domain/entities/project-request.entity";
import AppException from "@/shared/utils/exception.util";
import {
  createMockUser,
  createMockProject,
  createMockProjectRequest,
  createMockProjectRepository,
  createMockUserRepository,
  createMockProjectRequestRepository,
} from "../../test-helpers";

describe("CreateProjectRequestUseCase", () => {
  let useCase: CreateProjectRequestUseCase;
  let mockProjectRequestRepository: ReturnType<
    typeof createMockProjectRequestRepository
  >;
  let mockProjectRepository: ReturnType<typeof createMockProjectRepository>;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockProjectRequestRepository = createMockProjectRequestRepository();
    mockProjectRepository = createMockProjectRepository();
    mockUserRepository = createMockUserRepository();
    useCase = new CreateProjectRequestUseCase(
      mockProjectRequestRepository,
      mockProjectRepository,
      mockUserRepository
    );
  });

  describe("execute", () => {
    const validRequest = {
      userId: "user-456",
      projectId: "project-123",
      message: "I would like to join this project",
    };

    it("should create project request successfully", async () => {
      // Arrange
      const mockUser = createMockUser({ id: "user-456" });
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123", // Different from requester
      });
      const mockProjectRequest = createMockProjectRequest({
        userId: "user-456",
        projectId: "project-123",
        status: RequestStatus.PENDING,
        message: "I would like to join this project",
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.isMember.mockResolvedValue(false);
      mockProjectRequestRepository.existsByUserAndProject.mockResolvedValue(
        false
      );
      mockProjectRequestRepository.create.mockResolvedValue(mockProjectRequest);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.projectRequest).toEqual(mockProjectRequest);
      expect(mockUserRepository.findById).toHaveBeenCalledWith("user-456");
      expect(mockProjectRepository.findById).toHaveBeenCalledWith(
        "project-123"
      );
      expect(mockProjectRepository.isMember).toHaveBeenCalledWith(
        "project-123",
        "user-456"
      );
      expect(
        mockProjectRequestRepository.existsByUserAndProject
      ).toHaveBeenCalledWith("user-456", "project-123");
      expect(mockProjectRequestRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-456",
          projectId: "project-123",
          status: RequestStatus.PENDING,
          message: "I would like to join this project",
        })
      );
    });

    it("should throw error if user not found", async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new AppException("User not found with ID: user-456", 404)
      );
      expect(mockProjectRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if project not found", async () => {
      // Arrange
      const mockUser = createMockUser({ id: "user-456" });
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockProjectRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new AppException("Project not found with ID: project-123", 404)
      );
      expect(mockProjectRepository.isMember).not.toHaveBeenCalled();
    });

    it("should throw error if user is project creator", async () => {
      // Arrange
      const mockUser = createMockUser({ id: "user-456" });
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-456", // Same as requester
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockProjectRepository.findById.mockResolvedValue(mockProject);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new AppException(
          "Project creators cannot request to join their own projects",
          400
        )
      );
      expect(mockProjectRepository.isMember).not.toHaveBeenCalled();
    });

    it("should throw error if user is already a member", async () => {
      // Arrange
      const mockUser = createMockUser({ id: "user-456" });
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123",
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.isMember.mockResolvedValue(true);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new AppException("User is already a member of this project", 400)
      );
      expect(
        mockProjectRequestRepository.existsByUserAndProject
      ).not.toHaveBeenCalled();
    });

    it("should throw error if request already exists", async () => {
      // Arrange
      const mockUser = createMockUser({ id: "user-456" });
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123",
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.isMember.mockResolvedValue(false);
      mockProjectRequestRepository.existsByUserAndProject.mockResolvedValue(
        true
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new AppException("A request to join this project already exists", 400)
      );
      expect(mockProjectRequestRepository.create).not.toHaveBeenCalled();
    });

    it("should create request without message", async () => {
      // Arrange
      const requestWithoutMessage = {
        userId: "user-456",
        projectId: "project-123",
      };

      const mockUser = createMockUser({ id: "user-456" });
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123",
      });
      const mockProjectRequest = createMockProjectRequest({
        userId: "user-456",
        projectId: "project-123",
        status: RequestStatus.PENDING,
        message: undefined,
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.isMember.mockResolvedValue(false);
      mockProjectRequestRepository.existsByUserAndProject.mockResolvedValue(
        false
      );
      mockProjectRequestRepository.create.mockResolvedValue(mockProjectRequest);

      // Act
      const result = await useCase.execute(requestWithoutMessage);

      // Assert
      expect(result.projectRequest).toEqual(mockProjectRequest);
      expect(mockProjectRequestRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          message: undefined,
        })
      );
    });

    it("should handle repository creation failure", async () => {
      // Arrange
      const mockUser = createMockUser({ id: "user-456" });
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123",
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.isMember.mockResolvedValue(false);
      mockProjectRequestRepository.existsByUserAndProject.mockResolvedValue(
        false
      );
      mockProjectRequestRepository.create.mockRejectedValue(
        new Error("Database error")
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        "Database error"
      );
    });
  });
});
