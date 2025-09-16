import { DeleteProjectUseCase } from "@/application/use-cases/project/delete-project.use-case";
import AppException from "@/shared/utils/exception.util";
import {
  createMockProject,
  createMockProjectRepository,
  createMockUserRepository,
} from "../../test-helpers";

describe("DeleteProjectUseCase", () => {
  let useCase: DeleteProjectUseCase;
  let mockProjectRepository: ReturnType<typeof createMockProjectRepository>;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockProjectRepository = createMockProjectRepository();
    mockUserRepository = createMockUserRepository();
    useCase = new DeleteProjectUseCase(
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

    it("should delete project successfully for project creator", async () => {
      // Arrange
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123", // Same as requester
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.delete.mockResolvedValue(true);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(mockProjectRepository.findById).toHaveBeenCalledWith(
        "project-123"
      );
      expect(mockProjectRepository.delete).toHaveBeenCalledWith("project-123");
    });

    it("should throw error if project not found", async () => {
      // Arrange
      mockProjectRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new AppException("Project not found", 404)
      );
      expect(mockProjectRepository.delete).not.toHaveBeenCalled();
    });

    it("should allow committee member to delete any project", async () => {
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

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.delete.mockResolvedValue(true);

      // Act
      const result = await useCase.execute(committeeRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(mockProjectRepository.delete).toHaveBeenCalledWith("project-123");
    });

    it("should allow president to delete any project", async () => {
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

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.delete.mockResolvedValue(true);

      // Act
      const result = await useCase.execute(presidentRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(mockProjectRepository.delete).toHaveBeenCalledWith("project-123");
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

      // Mock canBeDeletedBy to return false
      jest.spyOn(mockProject, "canBeDeletedBy").mockReturnValue(false);

      mockProjectRepository.findById.mockResolvedValue(mockProject);

      // Act & Assert
      await expect(useCase.execute(unauthorizedRequest)).rejects.toThrow(
        new AppException("Insufficient permissions to delete this project", 403)
      );
      expect(mockProjectRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error if deletion fails", async () => {
      // Arrange
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123",
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.delete.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new AppException("Failed to delete project", 500)
      );
    });

    it("should allow leader to delete projects in their scope", async () => {
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

      // Mock canBeDeletedBy to return true for leader
      jest.spyOn(mockProject, "canBeDeletedBy").mockReturnValue(true);

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.delete.mockResolvedValue(true);

      // Act
      const result = await useCase.execute(leaderRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(mockProjectRepository.delete).toHaveBeenCalledWith("project-123");
    });

    it("should allow co-leader to delete projects in their scope", async () => {
      // Arrange
      const coLeaderRequest = {
        ...validRequest,
        userId: "co-leader-user",
        userRoles: ["co-leader"],
      };

      const mockProject = createMockProject({
        id: "project-123",
        userId: "different-user",
      });

      // Mock canBeDeletedBy to return true for co-leader
      jest.spyOn(mockProject, "canBeDeletedBy").mockReturnValue(true);

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.delete.mockResolvedValue(true);

      // Act
      const result = await useCase.execute(coLeaderRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(mockProjectRepository.delete).toHaveBeenCalledWith("project-123");
    });
  });
});
