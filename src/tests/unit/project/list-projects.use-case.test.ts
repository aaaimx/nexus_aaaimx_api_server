import { ListProjectsUseCase } from "@/application/use-cases/project/list-projects.use-case";
import { ContentStatus } from "@/domain/entities/project.entity";
import {
  createMockProject,
  createMockProjectRepository,
  createMockUserRepository,
} from "../../test-helpers";

describe("ListProjectsUseCase", () => {
  let useCase: ListProjectsUseCase;
  let mockProjectRepository: ReturnType<typeof createMockProjectRepository>;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockProjectRepository = createMockProjectRepository();
    mockUserRepository = createMockUserRepository();
    useCase = new ListProjectsUseCase(
      mockProjectRepository,
      mockUserRepository
    );
  });

  describe("execute", () => {
    const validRequest = {
      userId: "user-123",
      userRoles: ["member"],
    };

    it("should return projects successfully", async () => {
      // Arrange
      const mockProjects = [
        createMockProject({
          id: "project-1",
          name: "Public Project",
          isPublic: true,
          status: ContentStatus.PUBLISHED,
        }),
        createMockProject({
          id: "project-2",
          name: "User's Project",
          userId: "user-123",
          isPublic: false,
          status: ContentStatus.DRAFT,
        }),
      ];

      // Mock canBeViewedBy to return true for these projects
      mockProjects.forEach((project) => {
        jest.spyOn(project, "canBeViewedBy").mockReturnValue(true);
      });

      mockProjectRepository.findAll.mockResolvedValue(mockProjects);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.projects).toEqual(mockProjects);
      expect(result.total).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
      expect(mockProjectRepository.findAll).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
      });
    });

    it("should apply filters correctly", async () => {
      // Arrange
      const requestWithFilters = {
        ...validRequest,
        filters: {
          status: ContentStatus.PUBLISHED,
          isPublic: true,
          clubId: "club-123",
          divisionId: "division-123",
          tagId: "tag-123",
          search: "AI",
          limit: 10,
          offset: 5,
        },
      };

      const mockProjects = [
        createMockProject({
          id: "project-1",
          name: "AI Project",
          status: ContentStatus.PUBLISHED,
          isPublic: true,
        }),
      ];

      jest.spyOn(mockProjects[0], "canBeViewedBy").mockReturnValue(true);
      mockProjectRepository.findAll.mockResolvedValue(mockProjects);

      // Act
      const result = await useCase.execute(requestWithFilters);

      // Assert
      expect(mockProjectRepository.findAll).toHaveBeenCalledWith({
        status: ContentStatus.PUBLISHED,
        isPublic: true,
        clubId: "club-123",
        divisionId: "division-123",
        tagId: "tag-123",
        search: "AI",
        limit: 10,
        offset: 5,
      });
      expect(result.projects).toEqual(mockProjects);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(5);
    });

    it("should filter out projects user cannot view", async () => {
      // Arrange
      const mockProjects = [
        createMockProject({
          id: "project-1",
          name: "Viewable Project",
          isPublic: true,
        }),
        createMockProject({
          id: "project-2",
          name: "Private Project",
          isPublic: false,
          userId: "different-user",
        }),
      ];

      // Mock canBeViewedBy - first project viewable, second not
      jest.spyOn(mockProjects[0], "canBeViewedBy").mockReturnValue(true);
      jest.spyOn(mockProjects[1], "canBeViewedBy").mockReturnValue(false);

      mockProjectRepository.findAll.mockResolvedValue(mockProjects);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.projects).toHaveLength(1);
      expect(result.projects[0]).toEqual(mockProjects[0]);
      expect(result.total).toBe(1);
    });

    it("should allow committee members to see all projects", async () => {
      // Arrange
      const committeeRequest = {
        ...validRequest,
        userRoles: ["committee"],
      };

      const mockProjects = [
        createMockProject({ id: "project-1" }),
        createMockProject({ id: "project-2" }),
      ];

      mockProjects.forEach((project) => {
        jest.spyOn(project, "canBeViewedBy").mockReturnValue(true);
      });

      mockProjectRepository.findAll.mockResolvedValue(mockProjects);

      // Act
      const result = await useCase.execute(committeeRequest);

      // Assert
      expect(result.projects).toEqual(mockProjects);
      expect(result.total).toBe(2);
    });

    it("should allow president to see all projects", async () => {
      // Arrange
      const presidentRequest = {
        ...validRequest,
        userRoles: ["president"],
      };

      const mockProjects = [
        createMockProject({ id: "project-1" }),
        createMockProject({ id: "project-2" }),
      ];

      mockProjects.forEach((project) => {
        jest.spyOn(project, "canBeViewedBy").mockReturnValue(true);
      });

      mockProjectRepository.findAll.mockResolvedValue(mockProjects);

      // Act
      const result = await useCase.execute(presidentRequest);

      // Assert
      expect(result.projects).toEqual(mockProjects);
      expect(result.total).toBe(2);
    });

    it("should use default pagination when not provided", async () => {
      // Arrange
      const mockProjects = [];
      mockProjectRepository.findAll.mockResolvedValue(mockProjects);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(mockProjectRepository.findAll).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
      });
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
    });
  });
});
