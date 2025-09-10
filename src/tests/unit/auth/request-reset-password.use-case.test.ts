import { RequestResetPasswordUseCase } from "@/application/use-cases/auth/request-reset-password.use-case";
import { IUserRepository } from "@/domain/repositories/user.repository";
import {
  MailService,
  VerificationCodeService,
} from "@/infrastructure/external-services";
import { RequestResetPasswordSchemaType } from "@/interfaces/validators/schemas/user/request-reset-password.schema";
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

describe("RequestResetPasswordUseCase", () => {
  let requestResetPasswordUseCase: RequestResetPasswordUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockVerificationCodeService: jest.Mocked<VerificationCodeService>;
  let mockMailService: jest.Mocked<MailService>;

  const mockRequestInput: RequestResetPasswordSchemaType = {
    email: "test@example.com",
  };

  const mockUser: User = createMockUser();

  const mockResetCode = {
    code: "123456",
    expiresAt: new Date("2024-01-02"),
  };

  beforeEach(() => {
    // Create mocks
    mockUserRepository = createMockUserRepository();
    mockVerificationCodeService = createMockVerificationCodeService();
    mockMailService = createMockMailService();

    // Create use case instance
    requestResetPasswordUseCase = new RequestResetPasswordUseCase(
      mockUserRepository,
      mockVerificationCodeService,
      mockMailService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully process password reset request for existing user", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerificationCodeService.generateCode.mockReturnValue(mockResetCode);
      mockUserRepository.update.mockResolvedValue(mockUser);
      mockMailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      // Act
      await requestResetPasswordUseCase.execute(mockRequestInput);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        mockRequestInput.email
      );
      expect(mockVerificationCodeService.generateCode).toHaveBeenCalledWith(
        6,
        60
      );
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, {
        resetPasswordCode: mockResetCode.code,
        resetPasswordExpires: mockResetCode.expiresAt,
      });
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockRequestInput.email,
        mockResetCode.code,
        mockUser.firstName
      );
    });

    it("should return early when user does not exist (security measure)", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act
      await requestResetPasswordUseCase.execute(mockRequestInput);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        mockRequestInput.email
      );
      expect(mockVerificationCodeService.generateCode).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(mockMailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("should throw AppException when verification code generation fails", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerificationCodeService.generateCode.mockImplementation(() => {
        throw new Error("Code generation failed");
      });

      // Act & Assert
      await expect(
        requestResetPasswordUseCase.execute(mockRequestInput)
      ).rejects.toThrow(
        new AppException(
          "Error processing password reset request: Code generation failed",
          500
        )
      );
    });

    it("should throw AppException when user update fails", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerificationCodeService.generateCode.mockReturnValue(mockResetCode);
      mockUserRepository.update.mockRejectedValue(new Error("Database error"));

      // Act & Assert
      await expect(
        requestResetPasswordUseCase.execute(mockRequestInput)
      ).rejects.toThrow(
        new AppException(
          "Error processing password reset request: Database error",
          500
        )
      );
    });

    it("should throw AppException when email sending fails", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerificationCodeService.generateCode.mockReturnValue(mockResetCode);
      mockUserRepository.update.mockResolvedValue(mockUser);
      mockMailService.sendPasswordResetEmail.mockRejectedValue(
        new Error("Email service error")
      );

      // Act & Assert
      await expect(
        requestResetPasswordUseCase.execute(mockRequestInput)
      ).rejects.toThrow(
        new AppException(
          "Error processing password reset request: Email service error",
          500
        )
      );
    });

    it("should rethrow AppException when it's already an AppException", async () => {
      // Arrange
      const appException = new AppException("Custom error", 400);
      mockUserRepository.findByEmail.mockRejectedValue(appException);

      // Act & Assert
      await expect(
        requestResetPasswordUseCase.execute(mockRequestInput)
      ).rejects.toThrow(appException);
    });

    it("should handle user with null firstName gracefully", async () => {
      // Arrange
      const userWithoutFirstName = createMockUser();
      delete userWithoutFirstName.firstName;
      mockUserRepository.findByEmail.mockResolvedValue(userWithoutFirstName);
      mockVerificationCodeService.generateCode.mockReturnValue(mockResetCode);
      mockUserRepository.update.mockResolvedValue(userWithoutFirstName);
      mockMailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      // Act
      await requestResetPasswordUseCase.execute(mockRequestInput);

      // Assert
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockRequestInput.email,
        mockResetCode.code,
        userWithoutFirstName.firstName
      );
    });

    it("should handle user with empty firstName", async () => {
      // Arrange
      const userWithEmptyFirstName = createMockUser({
        firstName: "",
      });
      mockUserRepository.findByEmail.mockResolvedValue(userWithEmptyFirstName);
      mockVerificationCodeService.generateCode.mockReturnValue(mockResetCode);
      mockUserRepository.update.mockResolvedValue(userWithEmptyFirstName);
      mockMailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      // Act
      await requestResetPasswordUseCase.execute(mockRequestInput);

      // Assert
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockRequestInput.email,
        mockResetCode.code,
        userWithEmptyFirstName.firstName
      );
    });

    it("should generate code with correct parameters", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerificationCodeService.generateCode.mockReturnValue(mockResetCode);
      mockUserRepository.update.mockResolvedValue(mockUser);
      mockMailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      // Act
      await requestResetPasswordUseCase.execute(mockRequestInput);

      // Assert
      expect(mockVerificationCodeService.generateCode).toHaveBeenCalledWith(
        6,
        60
      );
    });

    it("should update user with correct reset password fields", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerificationCodeService.generateCode.mockReturnValue(mockResetCode);
      mockUserRepository.update.mockResolvedValue(mockUser);
      mockMailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      // Act
      await requestResetPasswordUseCase.execute(mockRequestInput);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, {
        resetPasswordCode: mockResetCode.code,
        resetPasswordExpires: mockResetCode.expiresAt,
      });
    });
  });
});
