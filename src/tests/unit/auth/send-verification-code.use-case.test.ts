import {
  SendVerificationCodeUseCase,
  SendVerificationCodeInput,
} from "@/application/use-cases/auth/send-verification-code.use-case";
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

describe("SendVerificationCodeUseCase", () => {
  let sendVerificationCodeUseCase: SendVerificationCodeUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockVerificationCodeService: jest.Mocked<VerificationCodeService>;
  let mockMailService: jest.Mocked<MailService>;

  const mockSendInput: SendVerificationCodeInput = {
    email: "test@example.com",
  };

  const mockUser: User = createMockUser({
    isEmailVerified: false,
  });

  const mockVerificationCode = {
    code: "123456",
    expiresAt: new Date("2024-01-02"),
  };

  beforeEach(() => {
    // Create mocks
    mockUserRepository = createMockUserRepository();
    mockVerificationCodeService = createMockVerificationCodeService();
    mockMailService = createMockMailService();

    // Create use case instance
    sendVerificationCodeUseCase = new SendVerificationCodeUseCase(
      mockUserRepository,
      mockVerificationCodeService,
      mockMailService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully send verification code to existing unverified user", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerificationCodeService.generateCode.mockReturnValue(
        mockVerificationCode
      );
      mockUserRepository.update.mockResolvedValue(mockUser);
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);

      // Act
      const result = await sendVerificationCodeUseCase.execute(mockSendInput);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        mockSendInput.email
      );
      expect(mockVerificationCodeService.generateCode).toHaveBeenCalled();
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.id, {
        verificationCode: mockVerificationCode.code,
        verificationExpires: mockVerificationCode.expiresAt,
      });
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith(
        mockSendInput.email,
        mockVerificationCode.code,
        mockUser.firstName
      );

      expect(result).toEqual({
        message:
          "If the email is registered, a verification code has been sent.",
      });
    });

    it("should return success message when user does not exist (security measure)", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await sendVerificationCodeUseCase.execute(mockSendInput);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        mockSendInput.email
      );
      expect(mockVerificationCodeService.generateCode).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(mockMailService.sendVerificationEmail).not.toHaveBeenCalled();

      expect(result).toEqual({
        message:
          "If the email is registered, a verification code has been sent.",
      });
    });

    it("should throw AppException when user is already verified", async () => {
      // Arrange
      const verifiedUser = { ...mockUser, isEmailVerified: true };
      mockUserRepository.findByEmail.mockResolvedValue(verifiedUser);

      // Act & Assert
      await expect(
        sendVerificationCodeUseCase.execute(mockSendInput)
      ).rejects.toThrow(new AppException("Email is already verified", 400));
    });

    it("should throw AppException when verification code generation fails", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerificationCodeService.generateCode.mockImplementation(() => {
        throw new Error("Code generation failed");
      });

      // Act & Assert
      await expect(
        sendVerificationCodeUseCase.execute(mockSendInput)
      ).rejects.toThrow(
        new AppException(
          "Error sending verification code: Code generation failed",
          500
        )
      );
    });

    it("should throw AppException when user update fails", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerificationCodeService.generateCode.mockReturnValue(
        mockVerificationCode
      );
      mockUserRepository.update.mockRejectedValue(new Error("Database error"));

      // Act & Assert
      await expect(
        sendVerificationCodeUseCase.execute(mockSendInput)
      ).rejects.toThrow(
        new AppException("Error sending verification code: Database error", 500)
      );
    });

    it("should throw AppException when email sending fails", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockVerificationCodeService.generateCode.mockReturnValue(
        mockVerificationCode
      );
      mockUserRepository.update.mockResolvedValue(mockUser);
      mockMailService.sendVerificationEmail.mockRejectedValue(
        new Error("Email service error")
      );

      // Act & Assert
      await expect(
        sendVerificationCodeUseCase.execute(mockSendInput)
      ).rejects.toThrow(
        new AppException(
          "Error sending verification code: Email service error",
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
        sendVerificationCodeUseCase.execute(mockSendInput)
      ).rejects.toThrow(appException);
    });

    it("should handle user with null firstName gracefully", async () => {
      // Arrange
      const userWithoutFirstName = createMockUser({
        isEmailVerified: false,
      });
      delete userWithoutFirstName.firstName;
      mockUserRepository.findByEmail.mockResolvedValue(userWithoutFirstName);
      mockVerificationCodeService.generateCode.mockReturnValue(
        mockVerificationCode
      );
      mockUserRepository.update.mockResolvedValue(userWithoutFirstName);
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);

      // Act
      const result = await sendVerificationCodeUseCase.execute(mockSendInput);

      // Assert
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith(
        mockSendInput.email,
        mockVerificationCode.code,
        userWithoutFirstName.firstName
      );
      expect(result).toEqual({
        message:
          "If the email is registered, a verification code has been sent.",
      });
    });

    it("should handle user with empty firstName", async () => {
      // Arrange
      const userWithEmptyFirstName = createMockUser({
        isEmailVerified: false,
        firstName: "",
      });
      mockUserRepository.findByEmail.mockResolvedValue(userWithEmptyFirstName);
      mockVerificationCodeService.generateCode.mockReturnValue(
        mockVerificationCode
      );
      mockUserRepository.update.mockResolvedValue(userWithEmptyFirstName);
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);

      // Act
      const result = await sendVerificationCodeUseCase.execute(mockSendInput);

      // Assert
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith(
        mockSendInput.email,
        mockVerificationCode.code,
        userWithEmptyFirstName.firstName
      );
      expect(result).toEqual({
        message:
          "If the email is registered, a verification code has been sent.",
      });
    });
  });
});
