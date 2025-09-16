import { UpdateProjectUseCase } from "@/application/use-cases/project/update-project.use-case";
import { ContentStatus } from "@/domain/entities/project.entity";
import AppException from "@/shared/utils/exception.util";
import {
  createMockProject,
  createMockProjectRepository,
  createMockUserRepository,
} from "../../test-helpers";

describe("UpdateProjectUseCase", () => {
  let useCase: UpdateProjectUseCase;
  let mockProjectRepository: ReturnType<typeof createMockProjectRepository>;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockProjectRepository = createMockProjectRepository();
    mockUserRepository = createMockUserRepository();
    useCase = new UpdateProjectUseCase(
      mockProjectRepository,
      mockUserRepository
    );
  });

  describe("execute", () => {
    const validRequest = {
      projectId: "project-123",
      userId: "user-123",
      userRoles: ["member"],
      data: {
        name: "Updated Project Name",
        description: "Updated description",
        status: ContentStatus.PUBLISHED,
        isPublic: true,
      },
    };

    it("should update project successfully for project creator", async () => {
      // Arrange
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123", // Same as requester
        name: "Original Name",
      });

      const updatedProject = createMockProject({
        ...mockProject,
        name: "Updated Project Name",
        description: "Updated description",
        status: ContentStatus.PUBLISHED,
        isPublic: true,
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.update.mockResolvedValue(updatedProject);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.project).toEqual(updatedProject);
      expect(mockProjectRepository.findById).toHaveBeenCalledWith(
        "project-123"
      );
      expect(mockProjectRepository.update).toHaveBeenCalledWith(
        "project-123",
        validRequest.data
      );
    });

    it("should throw error if project not found", async () => {
      // Arrange
      mockProjectRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new AppException("Project not found", 404)
      );
      expect(mockProjectRepository.update).not.toHaveBeenCalled();
    });

    it("should allow committee member to update any project", async () => {
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

      const updatedProject = createMockProject({
        ...mockProject,
        name: "Updated Project Name",
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.update.mockResolvedValue(updatedProject);

      // Act
      const result = await useCase.execute(committeeRequest);

      // Assert
      expect(result.project).toEqual(updatedProject);
      expect(mockProjectRepository.update).toHaveBeenCalled();
    });

    it("should allow president to update any project", async () => {
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

      const updatedProject = createMockProject({
        ...mockProject,
        name: "Updated Project Name",
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.update.mockResolvedValue(updatedProject);

      // Act
      const result = await useCase.execute(presidentRequest);

      // Assert
      expect(result.project).toEqual(updatedProject);
      expect(mockProjectRepository.update).toHaveBeenCalled();
    });

    it("should throw error for insufficient permissions", async () => {
      // Arrange
      const unauthorizedRequest = {
        ...validRequest,
        userId: "different-user",
        userRoles: ["member"],
      };

      const mockProject = createMockProject({
        id: "project-123",
        userId: "original-creator",
      });

      // Mock canBeEditedBy to return false
      jest.spyOn(mockProject, "canBeEditedBy").mockReturnValue(false);

      mockProjectRepository.findById.mockResolvedValue(mockProject);

      // Act & Assert
      await expect(useCase.execute(unauthorizedRequest)).rejects.toThrow(
        new AppException("Insufficient permissions to edit this project", 403)
      );
      expect(mockProjectRepository.update).not.toHaveBeenCalled();
    });

    it("should handle partial updates", async () => {
      // Arrange
      const partialUpdateRequest = {
        ...validRequest,
        data: {
          name: "Only Name Updated",
        },
      };

      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123",
        name: "Original Name",
      });

      const updatedProject = createMockProject({
        ...mockProject,
        name: "Only Name Updated",
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.update.mockResolvedValue(updatedProject);

      // Act
      const result = await useCase.execute(partialUpdateRequest);

      // Assert
      expect(result.project).toEqual(updatedProject);
      expect(mockProjectRepository.update).toHaveBeenCalledWith("project-123", {
        name: "Only Name Updated",
      });
    });

    it("should throw error if update fails", async () => {
      // Arrange
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123",
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.update.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new AppException("Failed to update project", 500)
      );
    });

    it("should allow leader to update projects in their scope", async () => {
      // Arrange
      const leaderRequest = {
        ...validRequest,
        userId: "leader-user",
        userRoles: ["leader"],
      };

      const mockProject = createMockProject({
        id: "project-123",
        userId: "different-user",
      });

      // Mock canBeEditedBy to return true for leader
      jest.spyOn(mockProject, "canBeEditedBy").mockReturnValue(true);

      const updatedProject = createMockProject({
        ...mockProject,
        name: "Updated by Leader",
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.update.mockResolvedValue(updatedProject);

      // Act
      const result = await useCase.execute(leaderRequest);

      // Assert
      expect(result.project).toEqual(updatedProject);
      expect(mockProjectRepository.update).toHaveBeenCalled();
    });
  });
});
