import { GetAccountUseCase } from "@/application/use-cases/account/get-account.use-case";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { User } from "@/domain/entities/user.entity";
import AppException from "@/shared/utils/exception.util";
import { createMockUserRepository, createMockUser } from "@/tests/test-helpers";

describe("GetAccountUseCase", () => {
  let getAccountUseCase: GetAccountUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  const mockUser: User = createMockUser();

  beforeEach(() => {
    // Create mocks
    mockUserRepository = createMockUserRepository();

    // Create use case instance
    getAccountUseCase = new GetAccountUseCase(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully retrieve account information", async () => {
      // Arrange
      const input = { userId: mockUser.id };
      const mockRoleId = "role-id";
      const mockDivisions = ["division-1", "division-2"];
      const mockClubs = ["club-1", "club-2"];

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.getUserRoleId.mockResolvedValue(mockRoleId);
      mockUserRepository.getUserDivisions.mockResolvedValue(mockDivisions);
      mockUserRepository.getUserClubs.mockResolvedValue(mockClubs);

      // Act
      const result = await getAccountUseCase.execute(input);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(input.userId);
      expect(mockUserRepository.getUserRoleId).toHaveBeenCalledWith(
        mockUser.id
      );
      expect(mockUserRepository.getUserDivisions).toHaveBeenCalledWith(
        mockUser.id
      );
      expect(mockUserRepository.getUserClubs).toHaveBeenCalledWith(mockUser.id);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        bio: mockUser.bio,
        photoUrl: mockUser.photoUrl,
        isEmailVerified: mockUser.isEmailVerified,
        isActive: mockUser.isActive,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        lastLoginAt: mockUser.lastLoginAt,
        allowNotifications: mockUser.allowNotifications,
        roleId: mockRoleId,
        divisions: mockDivisions,
        clubs: mockClubs,
      });
    });

    it("should return undefined for roleId, divisions, and clubs when they are empty", async () => {
      // Arrange
      const input = { userId: mockUser.id };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.getUserRoleId.mockResolvedValue(null);
      mockUserRepository.getUserDivisions.mockResolvedValue([]);
      mockUserRepository.getUserClubs.mockResolvedValue([]);

      // Act
      const result = await getAccountUseCase.execute(input);

      // Assert
      expect(result.roleId).toBeUndefined();
      expect(result.divisions).toBeUndefined();
      expect(result.clubs).toBeUndefined();
    });

    it("should throw AppException when user is not found", async () => {
      // Arrange
      const input = { userId: "nonexistent-id" };
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(getAccountUseCase.execute(input)).rejects.toThrow(
        new AppException("User not found", 404)
      );
    });

    it("should throw AppException when user is inactive", async () => {
      // Arrange
      const input = { userId: mockUser.id };
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserRepository.findById.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(getAccountUseCase.execute(input)).rejects.toThrow(
        new AppException("Account is deactivated", 403)
      );
    });

    it("should throw AppException when an unexpected error occurs", async () => {
      // Arrange
      const input = { userId: mockUser.id };
      mockUserRepository.findById.mockRejectedValue(
        new Error("Database error")
      );

      // Act & Assert
      await expect(getAccountUseCase.execute(input)).rejects.toThrow(
        new AppException(
          "Error retrieving account information: Database error",
          500
        )
      );
    });

    it("should rethrow AppException when it's already an AppException", async () => {
      // Arrange
      const input = { userId: mockUser.id };
      const appException = new AppException("Custom error", 400);
      mockUserRepository.findById.mockRejectedValue(appException);

      // Act & Assert
      await expect(getAccountUseCase.execute(input)).rejects.toThrow(
        appException
      );
    });
  });
});
