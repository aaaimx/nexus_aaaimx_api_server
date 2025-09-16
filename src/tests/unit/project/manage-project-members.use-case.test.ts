import { ManageProjectMembersUseCase } from "@/application/use-cases/project/manage-project-members.use-case";
import AppException from "@/shared/utils/exception.util";
import {
  createMockProject,
  createMockProjectRepository,
  createMockUserRepository,
} from "../../test-helpers";

describe("ManageProjectMembersUseCase", () => {
  let useCase: ManageProjectMembersUseCase;
  let mockProjectRepository: ReturnType<typeof createMockProjectRepository>;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockProjectRepository = createMockProjectRepository();
    mockUserRepository = createMockUserRepository();
    useCase = new ManageProjectMembersUseCase(
      mockProjectRepository,
      mockUserRepository
    );
  });

  describe("addMember", () => {
    const validRequest = {
      projectId: "project-123",
      userId: "user-123",
      userRoles: ["member"],
      memberId: "user-456",
    };

    it("should add member successfully for project creator", async () => {
      // Arrange
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123", // Same as requester
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.isMember.mockResolvedValue(false);
      mockProjectRepository.addMember.mockResolvedValue(true);

      // Act
      const result = await useCase.addMember(validRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(mockProjectRepository.findById).toHaveBeenCalledWith(
        "project-123"
      );
      expect(mockProjectRepository.isMember).toHaveBeenCalledWith(
        "project-123",
        "user-456"
      );
      expect(mockProjectRepository.addMember).toHaveBeenCalledWith(
        "project-123",
        "user-456"
      );
    });

    it("should throw error if project not found", async () => {
      // Arrange
      mockProjectRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.addMember(validRequest)).rejects.toThrow(
        new AppException("Project not found", 404)
      );
      expect(mockProjectRepository.addMember).not.toHaveBeenCalled();
    });

    it("should throw error if user is already a member", async () => {
      // Arrange
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123",
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.isMember.mockResolvedValue(true);

      // Act & Assert
      await expect(useCase.addMember(validRequest)).rejects.toThrow(
        new AppException("User is already a member of this project", 400)
      );
      expect(mockProjectRepository.addMember).not.toHaveBeenCalled();
    });

    it("should allow committee member to add members", async () => {
      // Arrange
      const committeeRequest = {
        ...validRequest,
        userId: "committee-user",
        userRoles: ["committee"],
      };

      const mockProject = createMockProject({
        id: "project-123",
        userId: "original-creator",
      });

      // Mock canManageMembersBy to return true for committee
      jest.spyOn(mockProject, "canManageMembersBy").mockReturnValue(true);

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.isMember.mockResolvedValue(false);
      mockProjectRepository.addMember.mockResolvedValue(true);

      // Act
      const result = await useCase.addMember(committeeRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(mockProjectRepository.addMember).toHaveBeenCalledWith(
        "project-123",
        "user-456"
      );
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

      // Mock canManageMembersBy to return false
      jest.spyOn(mockProject, "canManageMembersBy").mockReturnValue(false);

      mockProjectRepository.findById.mockResolvedValue(mockProject);

      // Act & Assert
      await expect(useCase.addMember(unauthorizedRequest)).rejects.toThrow(
        new AppException(
          "Insufficient permissions to manage project members",
          403
        )
      );
      expect(mockProjectRepository.addMember).not.toHaveBeenCalled();
    });

    it("should throw error if adding member fails", async () => {
      // Arrange
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123",
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.isMember.mockResolvedValue(false);
      mockProjectRepository.addMember.mockResolvedValue(false); // Failure

      // Act & Assert
      await expect(useCase.addMember(validRequest)).rejects.toThrow(
        new AppException("Failed to add member to project", 500)
      );
    });
  });

  describe("removeMember", () => {
    const validRequest = {
      projectId: "project-123",
      userId: "user-123",
      userRoles: ["member"],
      memberId: "user-456",
    };

    it("should remove member successfully for project creator", async () => {
      // Arrange
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123", // Same as requester
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.isMember.mockResolvedValue(true);
      mockProjectRepository.removeMember.mockResolvedValue(true);

      // Act
      const result = await useCase.removeMember(validRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(mockProjectRepository.findById).toHaveBeenCalledWith(
        "project-123"
      );
      expect(mockProjectRepository.isMember).toHaveBeenCalledWith(
        "project-123",
        "user-456"
      );
      expect(mockProjectRepository.removeMember).toHaveBeenCalledWith(
        "project-123",
        "user-456"
      );
    });

    it("should throw error if project not found", async () => {
      // Arrange
      mockProjectRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.removeMember(validRequest)).rejects.toThrow(
        new AppException("Project not found", 404)
      );
      expect(mockProjectRepository.removeMember).not.toHaveBeenCalled();
    });

    it("should throw error if user is not a member", async () => {
      // Arrange
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123",
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.isMember.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.removeMember(validRequest)).rejects.toThrow(
        new AppException("User is not a member of this project", 400)
      );
      expect(mockProjectRepository.removeMember).not.toHaveBeenCalled();
    });

    it("should throw error if removing member fails", async () => {
      // Arrange
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123",
      });

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.isMember.mockResolvedValue(true);
      mockProjectRepository.removeMember.mockResolvedValue(false); // Failure

      // Act & Assert
      await expect(useCase.removeMember(validRequest)).rejects.toThrow(
        new AppException("Failed to remove member from project", 500)
      );
    });
  });

  describe("getMembers", () => {
    const validRequest = {
      projectId: "project-123",
      userId: "user-123",
      userRoles: ["member"],
    };

    it("should get members successfully for project creator", async () => {
      // Arrange
      const mockProject = createMockProject({
        id: "project-123",
        userId: "user-123", // Same as requester
      });

      const memberIds = ["user-123", "user-456", "user-789"];

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.getMembers.mockResolvedValue(memberIds);

      // Act
      const result = await useCase.getMembers(validRequest);

      // Assert
      expect(result.memberIds).toEqual(memberIds);
      expect(mockProjectRepository.findById).toHaveBeenCalledWith(
        "project-123"
      );
      expect(mockProjectRepository.getMembers).toHaveBeenCalledWith(
        "project-123"
      );
    });

    it("should throw error if project not found", async () => {
      // Arrange
      mockProjectRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.getMembers(validRequest)).rejects.toThrow(
        new AppException("Project not found", 404)
      );
      expect(mockProjectRepository.getMembers).not.toHaveBeenCalled();
    });

    it("should allow public project members to be viewed by anyone", async () => {
      // Arrange
      const mockProject = createMockProject({
        id: "project-123",
        userId: "original-creator",
        isPublic: true,
      });

      // Mock canBeViewedBy to return true for public project
      jest.spyOn(mockProject, "canBeViewedBy").mockReturnValue(true);

      const memberIds = ["user-123", "user-456"];

      mockProjectRepository.findById.mockResolvedValue(mockProject);
      mockProjectRepository.getMembers.mockResolvedValue(memberIds);

      // Act
      const result = await useCase.getMembers(validRequest);

      // Assert
      expect(result.memberIds).toEqual(memberIds);
    });

    it("should throw error for insufficient permissions on private project", async () => {
      // Arrange
      const unauthorizedRequest = {
        ...validRequest,
        userId: "unauthorized-user",
        userRoles: ["member"],
      };

      const mockProject = createMockProject({
        id: "project-123",
        userId: "original-creator",
        isPublic: false,
      });

      // Mock canBeViewedBy to return false
      jest.spyOn(mockProject, "canBeViewedBy").mockReturnValue(false);

      mockProjectRepository.findById.mockResolvedValue(mockProject);

      // Act & Assert
      await expect(useCase.getMembers(unauthorizedRequest)).rejects.toThrow(
        new AppException(
          "Insufficient permissions to view project members",
          403
        )
      );
      expect(mockProjectRepository.getMembers).not.toHaveBeenCalled();
    });
  });
});
