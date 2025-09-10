import { ValidateAccessUseCase } from "@/application/use-cases/auth/validate-access.use-case";
import { IUserRepository } from "@/domain/repositories/user.repository";
import {
  ValidateAccessInput,
  ValidateAccessResult,
} from "@/interfaces/types/auth.types";
import { User } from "@/domain/entities/user.entity";
import AppException from "@/shared/utils/exception.util";
import { createMockUserRepository, createMockUser } from "@/tests/test-helpers";

describe("ValidateAccessUseCase", () => {
  let validateAccessUseCase: ValidateAccessUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  const mockValidateInput: ValidateAccessInput = {
    userId: "user-123",
  };

  const mockUser: User = createMockUser({
    isEmailVerified: true,
  });

  const expectedResult: ValidateAccessResult = {
    isValid: true,
  };

  beforeEach(() => {
    // Create mocks
    mockUserRepository = createMockUserRepository();

    // Create use case instance
    validateAccessUseCase = new ValidateAccessUseCase(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully validate access for verified user", async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await validateAccessUseCase.execute(mockValidateInput);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        mockValidateInput.userId
      );
      expect(result).toEqual(expectedResult);
    });

    it("should throw AppException when user is not found", async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        validateAccessUseCase.execute(mockValidateInput)
      ).rejects.toThrow(new AppException("User not found", 401));
    });

    it("should throw AppException when user email is not verified", async () => {
      // Arrange
      const unverifiedUser = { ...mockUser, isEmailVerified: false };
      mockUserRepository.findById.mockResolvedValue(unverifiedUser);

      // Act & Assert
      await expect(
        validateAccessUseCase.execute(mockValidateInput)
      ).rejects.toThrow(new AppException("Email not verified", 403));
    });

    it("should throw AppException when user lookup fails", async () => {
      // Arrange
      mockUserRepository.findById.mockRejectedValue(
        new Error("Database error")
      );

      // Act & Assert
      await expect(
        validateAccessUseCase.execute(mockValidateInput)
      ).rejects.toThrow(
        new AppException("Error validating access: Database error", 500)
      );
    });

    it("should rethrow AppException when it's already an AppException", async () => {
      // Arrange
      const appException = new AppException("Custom error", 400);
      mockUserRepository.findById.mockRejectedValue(appException);

      // Act & Assert
      await expect(
        validateAccessUseCase.execute(mockValidateInput)
      ).rejects.toThrow(appException);
    });

    it("should validate access for user with all required fields", async () => {
      // Arrange
      const completeUser: User = {
        id: "user-123",
        email: "test@example.com",
        password: "hashed-password",
        firstName: "John",
        lastName: "Doe",
        bio: "Test bio",
        photoUrl: "https://example.com/photo.jpg",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        lastLoginAt: new Date("2024-01-02"),
        allowNotifications: true,
        verificationCode: "123456",
        verificationExpires: new Date("2024-01-02"),
        resetPasswordCode: "654321",
        resetPasswordExpires: new Date("2024-01-02"),
        googleId: "google-123",
      };
      mockUserRepository.findById.mockResolvedValue(completeUser);

      // Act
      const result = await validateAccessUseCase.execute(mockValidateInput);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it("should validate access for user with minimal required fields", async () => {
      // Arrange
      const minimalUser: User = {
        id: "user-123",
        email: "test@example.com",
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        allowNotifications: false,
      };
      mockUserRepository.findById.mockResolvedValue(minimalUser);

      // Act
      const result = await validateAccessUseCase.execute(mockValidateInput);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it("should handle user with minimal optional fields", async () => {
      // Arrange
      const userWithMinimalFields: User = createMockUser({
        isEmailVerified: true,
      });
      mockUserRepository.findById.mockResolvedValue(userWithMinimalFields);

      // Act
      const result = await validateAccessUseCase.execute(mockValidateInput);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it("should handle different user ID formats", async () => {
      // Arrange
      const uuidInput = { userId: "550e8400-e29b-41d4-a716-446655440000" };
      const numericInput = { userId: "12345" };
      const stringInput = { userId: "user-abc-123" };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(validateAccessUseCase.execute(uuidInput)).resolves.toEqual(
        expectedResult
      );
      await expect(
        validateAccessUseCase.execute(numericInput)
      ).resolves.toEqual(expectedResult);
      await expect(validateAccessUseCase.execute(stringInput)).resolves.toEqual(
        expectedResult
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        uuidInput.userId
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        numericInput.userId
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        stringInput.userId
      );
    });

    it("should handle empty string user ID", async () => {
      // Arrange
      const emptyStringInput = { userId: "" };
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        validateAccessUseCase.execute(emptyStringInput)
      ).rejects.toThrow(new AppException("User not found", 401));
    });
  });
});
