import { CreateProjectUseCase } from "@/application/use-cases/project/create-project.use-case";
import { Project, ContentStatus } from "@/domain/entities/project.entity";
import AppException from "@/shared/utils/exception.util";
import {
  createMockUser,
  createMockProject,
  createMockProjectRepository,
  createMockUserRepository,
} from "../../test-helpers";

describe("CreateProjectUseCase", () => {
  let useCase: CreateProjectUseCase;
  let mockProjectRepository: ReturnType<typeof createMockProjectRepository>;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockProjectRepository = createMockProjectRepository();
    mockUserRepository = createMockUserRepository();
    useCase = new CreateProjectUseCase(
      mockProjectRepository,
      mockUserRepository
    );
  });

  describe("execute", () => {
    const validRequest = {
      name: "AI Research Project",
      description:
        "A comprehensive research project on artificial intelligence",
      coverUrl: "https://example.com/cover.jpg",
      isPublic: true,
      tagIds: ["tag-1", "tag-2"],
      clubIds: ["club-1"],
      divisionIds: ["division-1"],
      userId: "user-123",
      userRoles: ["committee"],
    };

    it("should create a project successfully", async () => {
      // Arrange
      const mockUser = createMockUser({ id: "user-123" });
      const mockProject = createMockProject({
        name: "AI Research Project",
        userId: "user-123",
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockProjectRepository.findByName.mockResolvedValue(null);
      mockProjectRepository.create.mockResolvedValue(mockProject);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.project).toEqual(mockProject);
      expect(mockUserRepository.findById).toHaveBeenCalledWith("user-123");
      expect(mockProjectRepository.findByName).toHaveBeenCalledWith(
        "AI Research Project"
      );
      expect(mockProjectRepository.create).toHaveBeenCalledWith(
        expect.any(Project)
      );
    });

    it("should throw error if user not found", async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new AppException("User not found with ID: user-123", 404)
      );
      expect(mockProjectRepository.findByName).not.toHaveBeenCalled();
      expect(mockProjectRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error if project name already exists", async () => {
      // Arrange
      const mockUser = createMockUser({ id: "user-123" });
      const existingProject = createMockProject({
        name: "AI Research Project",
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockProjectRepository.findByName.mockResolvedValue(existingProject);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new AppException("Project with this name already exists", 400)
      );
      expect(mockProjectRepository.create).not.toHaveBeenCalled();
    });

    it("should create project with minimal required fields", async () => {
      // Arrange
      const minimalRequest = {
        name: "Minimal Project",
        isPublic: true,
        userId: "user-123",
        userRoles: ["committee"],
      };

      const mockUser = createMockUser({ id: "user-123" });
      const mockProject = createMockProject({
        name: "Minimal Project",
        userId: "user-123",
        description: undefined,
        coverUrl: undefined,
        tags: [],
        clubIds: [],
        divisionIds: [],
      });

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockProjectRepository.findByName.mockResolvedValue(null);
      mockProjectRepository.create.mockResolvedValue(mockProject);

      // Act
      const result = await useCase.execute(minimalRequest);

      // Assert
      expect(result.project).toEqual(mockProject);
      expect(mockProjectRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Minimal Project",
          status: ContentStatus.DRAFT,
          isPublic: true,
          userId: "user-123",
        })
      );
    });

    it("should validate permissions for committee role", async () => {
      // Arrange
      const committeeRequest = {
        ...validRequest,
        userRoles: ["committee"],
      };

      const mockUser = createMockUser({ id: "user-123" });
      const mockProject = createMockProject();

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockProjectRepository.findByName.mockResolvedValue(null);
      mockProjectRepository.create.mockResolvedValue(mockProject);

      // Act
      const result = await useCase.execute(committeeRequest);

      // Assert
      expect(result.project).toEqual(mockProject);
      expect(mockProjectRepository.create).toHaveBeenCalled();
    });

    it("should validate permissions for president role", async () => {
      // Arrange
      const presidentRequest = {
        ...validRequest,
        userRoles: ["president"],
      };

      const mockUser = createMockUser({ id: "user-123" });
      const mockProject = createMockProject();

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockProjectRepository.findByName.mockResolvedValue(null);
      mockProjectRepository.create.mockResolvedValue(mockProject);

      // Act
      const result = await useCase.execute(presidentRequest);

      // Assert
      expect(result.project).toEqual(mockProject);
      expect(mockProjectRepository.create).toHaveBeenCalled();
    });
  });
});
