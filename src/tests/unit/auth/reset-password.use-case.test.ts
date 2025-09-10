import { ResetPasswordUseCase } from "@/application/use-cases/auth/reset-password.use-case";
import { IUserRepository } from "@/domain/repositories/user.repository";
import {
  MailService,
  PasswordService,
} from "@/infrastructure/external-services";
import { ResetPasswordSchemaType } from "@/interfaces/validators/schemas/user/reset-password.schema";
import { User } from "@/domain/entities/user.entity";
import AppException from "@/shared/utils/exception.util";
import {
  createMockUserRepository,
  createMockPasswordService,
  createMockMailService,
  createMockUser,
} from "@/tests/test-helpers";

// Mock dependencies
jest.mock("@/infrastructure/external-services");

describe("ResetPasswordUseCase", () => {
  let resetPasswordUseCase: ResetPasswordUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordService: jest.Mocked<PasswordService>;
  let mockMailService: jest.Mocked<MailService>;

  const mockResetInput: ResetPasswordSchemaType = {
    email: "test@example.com",
    reset_password_code: "123456",
    new_password: "newPassword123",
  };

  const mockUser: User = createMockUser({
    resetPasswordCode: "123456",
    resetPasswordExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  });

  const hashedNewPassword = "hashed-new-password";

  beforeEach(() => {
    // Create mocks
    mockUserRepository = createMockUserRepository();
    mockPasswordService = createMockPasswordService();
    mockMailService = createMockMailService();

    // Create use case instance
    resetPasswordUseCase = new ResetPasswordUseCase(
      mockUserRepository,
      mockPasswordService,
      mockMailService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully reset password with valid code", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.hash.mockResolvedValue(hashedNewPassword);
      mockUserRepository.update.mockResolvedValue(mockUser);
      mockUserRepository.clearResetPasswordFields.mockResolvedValue();
      mockMailService.sendPasswordResetSuccessEmail.mockResolvedValue(
        undefined
      );

      // Act
      await resetPasswordUseCase.execute(mockResetInput);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        mockResetInput.email
      );
      expect(mockPasswordService.hash).toHaveBeenCalledWith(
        mockResetInput.new_password
      );
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, {
        password: hashedNewPassword,
      });
      expect(mockUserRepository.clearResetPasswordFields).toHaveBeenCalledWith(
        mockUser.id
      );
      expect(
        mockMailService.sendPasswordResetSuccessEmail
      ).toHaveBeenCalledWith(mockResetInput.email, mockUser.firstName);
    });

    it("should throw AppException when user is not found", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(
        resetPasswordUseCase.execute(mockResetInput)
      ).rejects.toThrow(new AppException("Invalid or expired reset code", 400));
    });

    it("should throw AppException when user has no reset password code", async () => {
      // Arrange
      const userWithoutCode = createMockUser();
      delete userWithoutCode.resetPasswordCode;
      mockUserRepository.findByEmail.mockResolvedValue(userWithoutCode);

      // Act & Assert
      await expect(
        resetPasswordUseCase.execute(mockResetInput)
      ).rejects.toThrow(new AppException("Invalid or expired reset code", 400));
    });

    it("should throw AppException when user has no reset password expiration", async () => {
      // Arrange
      const userWithoutExpiration = createMockUser();
      delete userWithoutExpiration.resetPasswordExpires;
      mockUserRepository.findByEmail.mockResolvedValue(userWithoutExpiration);

      // Act & Assert
      await expect(
        resetPasswordUseCase.execute(mockResetInput)
      ).rejects.toThrow(new AppException("Invalid or expired reset code", 400));
    });

    it("should throw AppException when reset code does not match", async () => {
      // Arrange
      const userWithDifferentCode = createMockUser({
        resetPasswordCode: "654321",
      });
      mockUserRepository.findByEmail.mockResolvedValue(userWithDifferentCode);

      // Act & Assert
      await expect(
        resetPasswordUseCase.execute(mockResetInput)
      ).rejects.toThrow(new AppException("Invalid or expired reset code", 400));
    });

    it("should throw AppException when reset code is expired", async () => {
      // Arrange
      const userWithExpiredCode = createMockUser({
        resetPasswordCode: "123456",
        resetPasswordExpires: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      });
      mockUserRepository.findByEmail.mockResolvedValue(userWithExpiredCode);

      // Act & Assert
      await expect(
        resetPasswordUseCase.execute(mockResetInput)
      ).rejects.toThrow(new AppException("Invalid or expired reset code", 400));
    });

    it("should throw AppException when password hashing fails", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.hash.mockRejectedValue(new Error("Hashing failed"));

      // Act & Assert
      await expect(
        resetPasswordUseCase.execute(mockResetInput)
      ).rejects.toThrow(
        new AppException("Error resetting password: Hashing failed", 500)
      );
    });

    it("should throw AppException when user update fails", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.hash.mockResolvedValue(hashedNewPassword);
      mockUserRepository.update.mockRejectedValue(new Error("Database error"));

      // Act & Assert
      await expect(
        resetPasswordUseCase.execute(mockResetInput)
      ).rejects.toThrow(
        new AppException("Error resetting password: Database error", 500)
      );
    });

    it("should throw AppException when clearing reset password fields fails", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.hash.mockResolvedValue(hashedNewPassword);
      mockUserRepository.update.mockResolvedValue(mockUser);
      mockUserRepository.clearResetPasswordFields.mockRejectedValue(
        new Error("Clear fields error")
      );

      // Act & Assert
      await expect(
        resetPasswordUseCase.execute(mockResetInput)
      ).rejects.toThrow(
        new AppException("Error resetting password: Clear fields error", 500)
      );
    });

    it("should throw AppException when email sending fails", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.hash.mockResolvedValue(hashedNewPassword);
      mockUserRepository.update.mockResolvedValue(mockUser);
      mockUserRepository.clearResetPasswordFields.mockResolvedValue();
      mockMailService.sendPasswordResetSuccessEmail.mockRejectedValue(
        new Error("Email service error")
      );

      // Act & Assert
      await expect(
        resetPasswordUseCase.execute(mockResetInput)
      ).rejects.toThrow(
        new AppException("Error resetting password: Email service error", 500)
      );
    });

    it("should rethrow AppException when it's already an AppException", async () => {
      // Arrange
      const appException = new AppException("Custom error", 400);
      mockUserRepository.findByEmail.mockRejectedValue(appException);

      // Act & Assert
      await expect(
        resetPasswordUseCase.execute(mockResetInput)
      ).rejects.toThrow(appException);
    });

    it("should handle user with null firstName gracefully", async () => {
      // Arrange
      const userWithoutFirstName = createMockUser({
        resetPasswordCode: "123456",
        resetPasswordExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      });
      delete userWithoutFirstName.firstName;
      mockUserRepository.findByEmail.mockResolvedValue(userWithoutFirstName);
      mockPasswordService.hash.mockResolvedValue(hashedNewPassword);
      mockUserRepository.update.mockResolvedValue(userWithoutFirstName);
      mockUserRepository.clearResetPasswordFields.mockResolvedValue();
      mockMailService.sendPasswordResetSuccessEmail.mockResolvedValue(
        undefined
      );

      // Act
      await resetPasswordUseCase.execute(mockResetInput);

      // Assert
      expect(
        mockMailService.sendPasswordResetSuccessEmail
      ).toHaveBeenCalledWith(
        mockResetInput.email,
        userWithoutFirstName.firstName
      );
    });

    it("should handle user with empty firstName", async () => {
      // Arrange
      const userWithEmptyFirstName = createMockUser({
        resetPasswordCode: "123456",
        resetPasswordExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        firstName: "",
      });
      mockUserRepository.findByEmail.mockResolvedValue(userWithEmptyFirstName);
      mockPasswordService.hash.mockResolvedValue(hashedNewPassword);
      mockUserRepository.update.mockResolvedValue(userWithEmptyFirstName);
      mockUserRepository.clearResetPasswordFields.mockResolvedValue();
      mockMailService.sendPasswordResetSuccessEmail.mockResolvedValue(
        undefined
      );

      // Act
      await resetPasswordUseCase.execute(mockResetInput);

      // Assert
      expect(
        mockMailService.sendPasswordResetSuccessEmail
      ).toHaveBeenCalledWith(
        mockResetInput.email,
        userWithEmptyFirstName.firstName
      );
    });

    it("should handle exact expiration time edge case", async () => {
      // Arrange
      const now = new Date();
      const userWithExactExpiration = createMockUser({
        resetPasswordCode: "123456",
        resetPasswordExpires: new Date(now.getTime() - 1000), // 1 second ago
      });
      mockUserRepository.findByEmail.mockResolvedValue(userWithExactExpiration);

      // Act & Assert
      await expect(
        resetPasswordUseCase.execute(mockResetInput)
      ).rejects.toThrow(new AppException("Invalid or expired reset code", 400));
    });

    it("should handle case-sensitive reset code comparison", async () => {
      // Arrange
      const userWithUpperCaseCode = createMockUser({
        resetPasswordCode: "123456",
        resetPasswordExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      });
      const inputWithLowerCaseCode = {
        ...mockResetInput,
        reset_password_code: "123456",
      };
      mockUserRepository.findByEmail.mockResolvedValue(userWithUpperCaseCode);
      mockPasswordService.hash.mockResolvedValue(hashedNewPassword);
      mockUserRepository.update.mockResolvedValue(userWithUpperCaseCode);
      mockUserRepository.clearResetPasswordFields.mockResolvedValue();
      mockMailService.sendPasswordResetSuccessEmail.mockResolvedValue(
        undefined
      );

      // Act
      await resetPasswordUseCase.execute(inputWithLowerCaseCode);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        userWithUpperCaseCode.id,
        {
          password: hashedNewPassword,
        }
      );
    });
  });
});
