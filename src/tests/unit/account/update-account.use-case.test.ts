import { UpdateAccountUseCase } from "@/application/use-cases/account/update-account.use-case";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { User } from "@/domain/entities/user.entity";
import AppException from "@/shared/utils/exception.util";
import { createMockUserRepository, createMockUser } from "@/tests/test-helpers";

describe("UpdateAccountUseCase", () => {
  let updateAccountUseCase: UpdateAccountUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  const mockUser: User = createMockUser();

  beforeEach(() => {
    // Create mocks
    mockUserRepository = createMockUserRepository();

    // Create use case instance
    updateAccountUseCase = new UpdateAccountUseCase(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully update account information with all fields", async () => {
      // Arrange
      const input = {
        userId: mockUser.id,
        firstName: "Updated First Name",
        lastName: "Updated Last Name",
        bio: "Updated bio",
      };
      const updatedUser = {
        ...mockUser,
        firstName: input.firstName,
        lastName: input.lastName,
        bio: input.bio,
      };
      const mockRoleId = "role-id";
      const mockDivisions = ["division-1"];
      const mockClubs = ["club-1"];

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);
      mockUserRepository.getUserRoleId.mockResolvedValue(mockRoleId);
      mockUserRepository.getUserDivisions.mockResolvedValue(mockDivisions);
      mockUserRepository.getUserClubs.mockResolvedValue(mockClubs);

      // Act
      const result = await updateAccountUseCase.execute(input);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(input.userId);
      expect(mockUserRepository.update).toHaveBeenCalledWith(input.userId, {
        firstName: input.firstName,
        lastName: input.lastName,
        bio: input.bio,
      });
      expect(mockUserRepository.getUserRoleId).toHaveBeenCalledWith(
        updatedUser.id
      );
      expect(mockUserRepository.getUserDivisions).toHaveBeenCalledWith(
        updatedUser.id
      );
      expect(mockUserRepository.getUserClubs).toHaveBeenCalledWith(
        updatedUser.id
      );

      expect(result).toEqual({
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        bio: updatedUser.bio,
        photoUrl: updatedUser.photoUrl,
        isEmailVerified: updatedUser.isEmailVerified,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        lastLoginAt: updatedUser.lastLoginAt,
        allowNotifications: updatedUser.allowNotifications,
        roleId: mockRoleId,
        divisions: mockDivisions,
        clubs: mockClubs,
      });
    });

    it("should successfully update account information with only firstName", async () => {
      // Arrange
      const input = {
        userId: mockUser.id,
        firstName: "Updated First Name",
      };
      const updatedUser = {
        ...mockUser,
        firstName: input.firstName,
      };
      const mockRoleId = "role-id";
      const mockDivisions: string[] = [];
      const mockClubs: string[] = [];

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);
      mockUserRepository.getUserRoleId.mockResolvedValue(mockRoleId);
      mockUserRepository.getUserDivisions.mockResolvedValue(mockDivisions);
      mockUserRepository.getUserClubs.mockResolvedValue(mockClubs);

      // Act
      const result = await updateAccountUseCase.execute(input);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith(input.userId, {
        firstName: input.firstName,
      });
      expect(result.roleId).toBe(mockRoleId);
      expect(result.divisions).toBeUndefined();
      expect(result.clubs).toBeUndefined();
    });

    it("should successfully update account information with only lastName", async () => {
      // Arrange
      const input = {
        userId: mockUser.id,
        lastName: "Updated Last Name",
      };
      const updatedUser = {
        ...mockUser,
        lastName: input.lastName,
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);
      mockUserRepository.getUserRoleId.mockResolvedValue(null);
      mockUserRepository.getUserDivisions.mockResolvedValue([]);
      mockUserRepository.getUserClubs.mockResolvedValue([]);

      // Act
      const result = await updateAccountUseCase.execute(input);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith(input.userId, {
        lastName: input.lastName,
      });
      expect(result.lastName).toBe(input.lastName);
    });

    it("should successfully update account information with only bio", async () => {
      // Arrange
      const input = {
        userId: mockUser.id,
        bio: "Updated bio",
      };
      const updatedUser = {
        ...mockUser,
        bio: input.bio,
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);
      mockUserRepository.getUserRoleId.mockResolvedValue(null);
      mockUserRepository.getUserDivisions.mockResolvedValue([]);
      mockUserRepository.getUserClubs.mockResolvedValue([]);

      // Act
      const result = await updateAccountUseCase.execute(input);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith(input.userId, {
        bio: input.bio,
      });
      expect(result.bio).toBe(input.bio);
    });

    it("should throw AppException when user is not found", async () => {
      // Arrange
      const input = {
        userId: "nonexistent-id",
        firstName: "Updated First Name",
      };
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(updateAccountUseCase.execute(input)).rejects.toThrow(
        new AppException("User not found", 404)
      );
    });

    it("should throw AppException when user is inactive", async () => {
      // Arrange
      const input = {
        userId: mockUser.id,
        firstName: "Updated First Name",
      };
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserRepository.findById.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(updateAccountUseCase.execute(input)).rejects.toThrow(
        new AppException("Account is deactivated", 403)
      );
    });

    it("should throw AppException when an unexpected error occurs", async () => {
      // Arrange
      const input = {
        userId: mockUser.id,
        firstName: "Updated First Name",
      };
      mockUserRepository.findById.mockRejectedValue(
        new Error("Database error")
      );

      // Act & Assert
      await expect(updateAccountUseCase.execute(input)).rejects.toThrow(
        new AppException(
          "Error updating account information: Database error",
          500
        )
      );
    });

    it("should rethrow AppException when it's already an AppException", async () => {
      // Arrange
      const input = {
        userId: mockUser.id,
        firstName: "Updated First Name",
      };
      const appException = new AppException("Custom error", 400);
      mockUserRepository.findById.mockRejectedValue(appException);

      // Act & Assert
      await expect(updateAccountUseCase.execute(input)).rejects.toThrow(
        appException
      );
    });
  });
});
