import { GetProjectUseCase } from "@/application/use-cases/project/get-project.use-case";
import { ContentStatus } from "@/domain/entities/project.entity";
import AppException from "@/shared/utils/exception.util";
import {
  createMockProject,
  createMockProjectRepository,
  createMockUserRepository,
} from "../../test-helpers";

describe("GetProjectUseCase", () => {
  let useCase: GetProjectUseCase;
  let mockProjectRepository: ReturnType<typeof createMockProjectRepository>;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockProjectRepository = createMockProjectRepository();
    mockUserRepository = createMockUserRepository();
    useCase = new GetProjectUseCase(mockProjectRepository, mockUserRepository);
  });

  describe("execute", () => {
    const validRequest = {
      projectId: "project-123",
      userId: "user-123",
      userRoles: ["member"],
    };

    it("should return project successfully for public project", async () => {
      // Arrange
      const mockProject = createMockProject({
        id: "project-123",
        isPublic: true,
        status: ContentStatus.PUBLISHED,
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.project).toEqual(mockProject);
      expect(mockProjectRepository.findById).toHaveBeenCalledWith(
        "project-123"
      );
    });

    it("should throw error if project not found", async () => {
      // Arrange
      mockProjectRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new AppException("Project not found", 404)
      );
    });

    it("should return project for project creator", async () => {
      // Arrange
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123", // Same as requester
        isPublic: false,
        status: ContentStatus.DRAFT,
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.project).toEqual(mockProject);
    });

    it("should return project for committee member", async () => {
      // Arrange
      const committeeRequest = {
        ...validRequest,
        userRoles: ["committee"],
      };

      const mockProject = createMockProject({
        id: "project-123",
        userId: "different-user",
        isPublic: false,
        status: ContentStatus.DRAFT,
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);

      // Act
      const result = await useCase.execute(committeeRequest);

      // Assert
      expect(result.project).toEqual(mockProject);
    });

    it("should return project for president", async () => {
      // Arrange
      const presidentRequest = {
        ...validRequest,
        userRoles: ["president"],
      };

      const mockProject = createMockProject({
        id: "project-123",
        userId: "different-user",
        isPublic: false,
        status: ContentStatus.DRAFT,
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);

      // Act
      const result = await useCase.execute(presidentRequest);

      // Assert
      expect(result.project).toEqual(mockProject);
    });

    it("should throw error for insufficient permissions", async () => {
      // Arrange
      const mockProject = createMockProject({
        id: "project-123",
        userId: "different-user",
        isPublic: false,
        status: ContentStatus.DRAFT,
      });

      // Mock the canBeViewedBy method to return false
      jest.spyOn(mockProject, "canBeViewedBy").mockReturnValue(false);

      mockProjectRepository.findById.mockResolvedValue(mockProject);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new AppException("Insufficient permissions to view this project", 403)
      );
    });

    it("should allow access to published public project", async () => {
      // Arrange
      const mockProject = createMockProject({
        id: "project-123",
        userId: "different-user",
        isPublic: true,
        status: ContentStatus.PUBLISHED,
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.project).toEqual(mockProject);
    });
  });
});
