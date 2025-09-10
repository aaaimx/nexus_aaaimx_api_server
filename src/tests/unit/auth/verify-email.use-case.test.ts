import {
  VerifyEmailUseCase,
  VerifyEmailInput,
} from "@/application/use-cases/auth/verify-email.use-case";
import { IUserRepository } from "@/domain/repositories/user.repository";
import {
  VerificationCodeService,
  MailService,
} from "@/infrastructure/external-services";
import { User } from "@/domain/entities/user.entity";
import AppException from "@/shared/utils/exception.util";
import {
  createMockUserRepository,
  createMockVerificationCodeService,
  createMockMailService,
  createMockUser,
} from "@/tests/test-helpers";

// Mock dependencies
jest.mock("@/infrastructure/external-services");

describe("VerifyEmailUseCase", () => {
  let verifyEmailUseCase: VerifyEmailUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockVerificationCodeService: jest.Mocked<VerificationCodeService>;
  let mockMailService: jest.Mocked<MailService>;

  const mockVerifyInput: VerifyEmailInput = {
    email: "test@example.com",
    verification_code: "123456",
  };

  const mockUser: User = createMockUser({
    isEmailVerified: false,
    verificationCode: "123456",
    verificationExpires: new Date("2024-01-02"),
  });

  const mockUpdatedUser: User = createMockUser({
    isEmailVerified: true,
  });

  beforeEach(() => {
    // Create mocks
    mockUserRepository = createMockUserRepository();
    mockVerificationCodeService = createMockVerificationCodeService();
    mockMailService = createMockMailService();

    // Create use case instance
    verifyEmailUseCase = new VerifyEmailUseCase(
      mockUserRepository,
      mockVerificationCodeService,
      mockMailService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully verify email with valid code", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerificationCodeService.validateCode.mockReturnValue(true);
      mockUserRepository.update.mockResolvedValue(mockUpdatedUser);
      mockUserRepository.clearVerificationFields.mockResolvedValue();
      mockMailService.sendVerificationSuccessEmail.mockResolvedValue(undefined);

      // Act
      const result = await verifyEmailUseCase.execute(mockVerifyInput);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        mockVerifyInput.email
      );
      expect(mockVerificationCodeService.validateCode).toHaveBeenCalledWith(
        mockVerifyInput.verification_code,
        mockUser.verificationCode,
        mockUser.verificationExpires
      );
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, {
        isEmailVerified: true,
      });
      expect(mockUserRepository.clearVerificationFields).toHaveBeenCalledWith(
        mockUser.id
      );
      expect(mockMailService.sendVerificationSuccessEmail).toHaveBeenCalledWith(
        mockVerifyInput.email,
        mockUpdatedUser.firstName
      );

      expect(result).toEqual({
        message: "Email verified successfully.",
        user: mockUpdatedUser,
      });
    });

    it("should throw AppException when user is not found", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(verifyEmailUseCase.execute(mockVerifyInput)).rejects.toThrow(
        new AppException("User not found", 404)
      );
    });

    it("should throw AppException when email is already verified", async () => {
      // Arrange
      const verifiedUser = { ...mockUser, isEmailVerified: true };
      mockUserRepository.findByEmail.mockResolvedValue(verifiedUser);

      // Act & Assert
      await expect(verifyEmailUseCase.execute(mockVerifyInput)).rejects.toThrow(
        new AppException("Email is already verified", 400)
      );
    });

    it("should throw AppException when no verification code exists", async () => {
      // Arrange
      const userWithoutCode = createMockUser({
        isEmailVerified: false,
      });
      delete userWithoutCode.verificationCode;
      mockUserRepository.findByEmail.mockResolvedValue(userWithoutCode);

      // Act & Assert
      await expect(verifyEmailUseCase.execute(mockVerifyInput)).rejects.toThrow(
        new AppException("No verification code found for this user", 400)
      );
    });

    it("should throw AppException when verification code is invalid", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerificationCodeService.validateCode.mockReturnValue(false);

      // Act & Assert
      await expect(verifyEmailUseCase.execute(mockVerifyInput)).rejects.toThrow(
        new AppException("Invalid verification code", 400)
      );
    });

    it("should throw AppException when user update fails", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerificationCodeService.validateCode.mockReturnValue(true);
      mockUserRepository.update.mockRejectedValue(new Error("Database error"));

      // Act & Assert
      await expect(verifyEmailUseCase.execute(mockVerifyInput)).rejects.toThrow(
        new AppException("Error verifying email: Database error", 500)
      );
    });

    it("should throw AppException when clearing verification fields fails", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerificationCodeService.validateCode.mockReturnValue(true);
      mockUserRepository.update.mockResolvedValue(mockUpdatedUser);
      mockUserRepository.clearVerificationFields.mockRejectedValue(
        new Error("Clear fields error")
      );

      // Act & Assert
      await expect(verifyEmailUseCase.execute(mockVerifyInput)).rejects.toThrow(
        new AppException("Error verifying email: Clear fields error", 500)
      );
    });

    it("should throw AppException when email sending fails", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerificationCodeService.validateCode.mockReturnValue(true);
      mockUserRepository.update.mockResolvedValue(mockUpdatedUser);
      mockUserRepository.clearVerificationFields.mockResolvedValue();
      mockMailService.sendVerificationSuccessEmail.mockRejectedValue(
        new Error("Email service error")
      );

      // Act & Assert
      await expect(verifyEmailUseCase.execute(mockVerifyInput)).rejects.toThrow(
        new AppException("Error verifying email: Email service error", 500)
      );
    });

    it("should rethrow AppException when it's already an AppException", async () => {
      // Arrange
      const appException = new AppException("Custom error", 400);
      mockUserRepository.findByEmail.mockRejectedValue(appException);

      // Act & Assert
      await expect(verifyEmailUseCase.execute(mockVerifyInput)).rejects.toThrow(
        appException
      );
    });

    it("should handle verification code validation with expiration check", async () => {
      // Arrange
      const expiredUser = {
        ...mockUser,
        verificationExpires: new Date("2024-01-01"), // Past date
      };
      mockUserRepository.findByEmail.mockResolvedValue(expiredUser);
      mockVerificationCodeService.validateCode.mockReturnValue(false);

      // Act & Assert
      await expect(verifyEmailUseCase.execute(mockVerifyInput)).rejects.toThrow(
        new AppException("Invalid verification code", 400)
      );

      expect(mockVerificationCodeService.validateCode).toHaveBeenCalledWith(
        mockVerifyInput.verification_code,
        expiredUser.verificationCode,
        expiredUser.verificationExpires
      );
    });
  });
});
