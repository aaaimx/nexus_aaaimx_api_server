import { GetRolesCatalogUseCase } from "@/application/use-cases/role/get-roles-catalog.use-case";
import { IRoleRepository } from "@/domain/repositories/role.repository";
import { Role } from "@/domain/entities/role.entity";
import AppException from "@/shared/utils/exception.util";
import { createMockRoleRepository, createMockRole } from "@/tests/test-helpers";

// Mock logger
jest.mock("@/infrastructure/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe("GetRolesCatalogUseCase", () => {
  let getRolesCatalogUseCase: GetRolesCatalogUseCase;
  let mockRoleRepository: jest.Mocked<IRoleRepository>;

  const mockRoles: Role[] = [
    createMockRole({
      id: "role-1",
      name: "admin",
      description: "Administrator role with full system access",
    }),
    createMockRole({
      id: "role-2",
      name: "moderator",
      description: "Moderator role with limited administrative access",
    }),
    createMockRole({
      id: "role-3",
      name: "coordinator",
      description: "Coordinator role for event management",
    }),
  ];

  const adminRole = createMockRole({
    id: "admin-role-id",
    name: "admin",
    description: "Administrator role",
  });

  const memberRole = createMockRole({
    id: "member-role-id",
    name: "member",
    description: "Basic member role",
  });

  const seniorMemberRole = createMockRole({
    id: "senior-member-role-id",
    name: "senior member",
    description: "Senior member role",
  });

  beforeEach(() => {
    // Create mocks
    mockRoleRepository = createMockRoleRepository();

    // Create use case instance
    getRolesCatalogUseCase = new GetRolesCatalogUseCase(mockRoleRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully retrieve roles catalog for admin user", async () => {
      // Arrange
      mockRoleRepository.findById.mockResolvedValue(adminRole);
      mockRoleRepository.findAll.mockResolvedValue(mockRoles);

      // Act
      const result = await getRolesCatalogUseCase.execute(adminRole.id);

      // Assert
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(adminRole.id);
      expect(mockRoleRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockRoles);
    });

    it("should successfully retrieve roles catalog for moderator user", async () => {
      // Arrange
      const moderatorRole = createMockRole({
        id: "moderator-role-id",
        name: "moderator",
        description: "Moderator role",
      });
      mockRoleRepository.findById.mockResolvedValue(moderatorRole);
      mockRoleRepository.findAll.mockResolvedValue(mockRoles);

      // Act
      const result = await getRolesCatalogUseCase.execute(moderatorRole.id);

      // Assert
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(
        moderatorRole.id
      );
      expect(mockRoleRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockRoles);
    });

    it("should throw AppException when user role is not found", async () => {
      // Arrange
      mockRoleRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        getRolesCatalogUseCase.execute("non-existent-role-id")
      ).rejects.toThrow(new AppException("User role not found", 404));
    });

    it("should throw AppException when user is a member", async () => {
      // Arrange
      mockRoleRepository.findById.mockResolvedValue(memberRole);

      // Act & Assert
      await expect(
        getRolesCatalogUseCase.execute(memberRole.id)
      ).rejects.toThrow(
        new AppException("Insufficient permissions to view roles catalog", 403)
      );
    });

    it("should throw AppException when user is a senior member", async () => {
      // Arrange
      mockRoleRepository.findById.mockResolvedValue(seniorMemberRole);

      // Act & Assert
      await expect(
        getRolesCatalogUseCase.execute(seniorMemberRole.id)
      ).rejects.toThrow(
        new AppException("Insufficient permissions to view roles catalog", 403)
      );
    });

    it("should return empty array when no roles exist", async () => {
      // Arrange
      mockRoleRepository.findById.mockResolvedValue(adminRole);
      mockRoleRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await getRolesCatalogUseCase.execute(adminRole.id);

      // Assert
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(adminRole.id);
      expect(mockRoleRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it("should throw AppException when repository throws error during role lookup", async () => {
      // Arrange
      const errorMessage = "Database connection failed";
      mockRoleRepository.findById.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(
        getRolesCatalogUseCase.execute(adminRole.id)
      ).rejects.toThrow(
        new AppException("Failed to retrieve roles catalog", 500)
      );
    });

    it("should throw AppException when repository throws error during roles fetch", async () => {
      // Arrange
      mockRoleRepository.findById.mockResolvedValue(adminRole);
      const errorMessage = "Database connection failed";
      mockRoleRepository.findAll.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(
        getRolesCatalogUseCase.execute(adminRole.id)
      ).rejects.toThrow(
        new AppException("Failed to retrieve roles catalog", 500)
      );
    });

    it("should rethrow AppException when it's already an AppException", async () => {
      // Arrange
      const appException = new AppException("Custom error", 400);
      mockRoleRepository.findById.mockRejectedValue(appException);

      // Act & Assert
      await expect(
        getRolesCatalogUseCase.execute(adminRole.id)
      ).rejects.toThrow(appException);
    });

    it("should return empty array when repository returns null", async () => {
      // Arrange
      mockRoleRepository.findById.mockResolvedValue(adminRole);
      mockRoleRepository.findAll.mockResolvedValue(null as any);

      // Act
      const result = await getRolesCatalogUseCase.execute(adminRole.id);

      // Assert
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(adminRole.id);
      expect(mockRoleRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it("should return empty array when repository returns undefined", async () => {
      // Arrange
      mockRoleRepository.findById.mockResolvedValue(adminRole);
      mockRoleRepository.findAll.mockResolvedValue(undefined as any);

      // Act
      const result = await getRolesCatalogUseCase.execute(adminRole.id);

      // Assert
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(adminRole.id);
      expect(mockRoleRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it("should handle single role in catalog", async () => {
      // Arrange
      const singleRole = [createMockRole()];
      mockRoleRepository.findById.mockResolvedValue(adminRole);
      mockRoleRepository.findAll.mockResolvedValue(singleRole);

      // Act
      const result = await getRolesCatalogUseCase.execute(adminRole.id);

      // Assert
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(adminRole.id);
      expect(mockRoleRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(singleRole);
      expect(result).toHaveLength(1);
    });
  });
});
