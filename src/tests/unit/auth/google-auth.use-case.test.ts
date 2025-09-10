import { GoogleAuthUseCase } from "@/application/use-cases/auth/google-auth.use-case";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { IRoleRepository } from "@/domain/repositories/role.repository";
import { MailService } from "@/infrastructure/external-services";
import { GoogleUserInfo } from "@/infrastructure/external-services/google-oauth.service";
import { User } from "@/domain/entities/user.entity";
import { Role } from "@/domain/entities/role.entity";
import AppException from "@/shared/utils/exception.util";
import {
  createMockUserRepository,
  createMockRoleRepository,
  createMockMailService,
  createMockUser,
  createMockRole,
  createMockGoogleUser,
} from "@/tests/test-helpers";

// Mock dependencies
jest.mock("@/infrastructure/external-services");

describe("GoogleAuthUseCase", () => {
  let googleAuthUseCase: GoogleAuthUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockMailService: jest.Mocked<MailService>;
  let mockRoleRepository: jest.Mocked<IRoleRepository>;

  const mockGoogleUser: GoogleUserInfo = createMockGoogleUser();

  const mockExistingUser: User = createMockUser({
    email: "john.doe@gmail.com",
    googleId: "google-123",
  });

  const mockUserWithEmail: User = createMockUser({
    id: "user-456",
    email: "john.doe@gmail.com",
  });

  const mockUpdatedUser: User = createMockUser({
    id: "user-456",
    email: "john.doe@gmail.com",
    googleId: "google-123",
  });

  const mockNewUser: User = createMockUser({
    id: "user-789",
    email: "john.doe@gmail.com",
    password: "random-uuid",
    googleId: "google-123",
  });

  const mockRole: Role = createMockRole();

  beforeEach(() => {
    // Create mocks
    mockUserRepository = createMockUserRepository();
    mockMailService = createMockMailService();
    mockRoleRepository = createMockRoleRepository();

    // Create use case instance
    googleAuthUseCase = new GoogleAuthUseCase(
      mockUserRepository,
      mockMailService,
      mockRoleRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should return existing user when Google ID already exists", async () => {
      // Arrange
      mockUserRepository.findByGoogleId.mockResolvedValue(mockExistingUser);

      // Act
      const result = await googleAuthUseCase.execute(mockGoogleUser);

      // Assert
      expect(mockUserRepository.findByGoogleId).toHaveBeenCalledWith(
        mockGoogleUser.id
      );
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(result).toEqual({
        user: mockExistingUser,
        isNewUser: false,
      });
    });

    it("should link Google ID to existing user with same email", async () => {
      // Arrange
      mockUserRepository.findByGoogleId.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(mockUserWithEmail);
      mockUserRepository.update.mockResolvedValue(mockUpdatedUser);
      mockMailService.sendEmailVerifiedConfirmation.mockResolvedValue(
        undefined
      );

      // Act
      const result = await googleAuthUseCase.execute(mockGoogleUser);

      // Assert
      expect(mockUserRepository.findByGoogleId).toHaveBeenCalledWith(
        mockGoogleUser.id
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        mockGoogleUser.email
      );
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        mockUserWithEmail.id,
        {
          googleId: mockGoogleUser.id,
        }
      );
      expect(
        mockMailService.sendEmailVerifiedConfirmation
      ).toHaveBeenCalledWith(mockUpdatedUser.email, mockUpdatedUser.firstName);
      expect(result).toEqual({
        user: mockUpdatedUser,
        isNewUser: false,
      });
    });

    it("should return existing user with Google ID when email exists and already has Google ID", async () => {
      // Arrange
      const userWithGoogleId = {
        ...mockUserWithEmail,
        googleId: "existing-google-id",
      };
      mockUserRepository.findByGoogleId.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(userWithGoogleId);

      // Act
      const result = await googleAuthUseCase.execute(mockGoogleUser);

      // Assert
      expect(mockUserRepository.findByGoogleId).toHaveBeenCalledWith(
        mockGoogleUser.id
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        mockGoogleUser.email
      );
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(result).toEqual({
        user: userWithGoogleId,
        isNewUser: false,
      });
    });

    it("should create new user when no existing user found", async () => {
      // Arrange
      mockUserRepository.findByGoogleId.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleRepository.findByName.mockResolvedValue(mockRole);
      mockUserRepository.create.mockResolvedValue(mockNewUser);
      mockUserRepository.assignRole.mockResolvedValue();
      mockMailService.sendEmailVerifiedConfirmation.mockResolvedValue(
        undefined
      );

      // Act
      const result = await googleAuthUseCase.execute(mockGoogleUser);

      // Assert
      expect(mockUserRepository.findByGoogleId).toHaveBeenCalledWith(
        mockGoogleUser.id
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        mockGoogleUser.email
      );
      expect(mockRoleRepository.findByName).toHaveBeenCalledWith("member");
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        firstName: mockGoogleUser.given_name,
        lastName: mockGoogleUser.family_name,
        email: mockGoogleUser.email,
        password: expect.any(String), // crypto.randomUUID()
        googleId: mockGoogleUser.id,
        isEmailVerified: mockGoogleUser.verified_email,
        isActive: true,
        allowNotifications: true,
      });
      expect(mockUserRepository.assignRole).toHaveBeenCalledWith(
        mockNewUser.id,
        mockRole.id
      );
      expect(
        mockMailService.sendEmailVerifiedConfirmation
      ).toHaveBeenCalledWith(mockNewUser.email, mockNewUser.firstName);
      expect(result).toEqual({
        user: mockNewUser,
        isNewUser: true,
      });
    });

    it("should throw AppException when Google user info is invalid", async () => {
      // Arrange
      const invalidGoogleUser = createMockGoogleUser({ id: "" });

      // Act & Assert
      await expect(
        googleAuthUseCase.execute(invalidGoogleUser)
      ).rejects.toThrow(
        new AppException("Invalid Google user information", 400)
      );
    });

    it("should throw AppException when Google user email is missing", async () => {
      // Arrange
      const invalidGoogleUser = createMockGoogleUser({ email: "" });

      // Act & Assert
      await expect(
        googleAuthUseCase.execute(invalidGoogleUser)
      ).rejects.toThrow(
        new AppException("Invalid Google user information", 400)
      );
    });

    it("should throw AppException when default role is not found", async () => {
      // Arrange
      mockUserRepository.findByGoogleId.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleRepository.findByName.mockResolvedValue(null);

      // Act & Assert
      await expect(googleAuthUseCase.execute(mockGoogleUser)).rejects.toThrow(
        new AppException("Default role not found", 500)
      );
    });

    it("should throw AppException when user creation fails", async () => {
      // Arrange
      mockUserRepository.findByGoogleId.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleRepository.findByName.mockResolvedValue(mockRole);
      mockUserRepository.create.mockRejectedValue(new Error("Database error"));

      // Act & Assert
      await expect(googleAuthUseCase.execute(mockGoogleUser)).rejects.toThrow(
        new AppException(
          "Error during Google authentication: Database error",
          500
        )
      );
    });

    it("should throw AppException when role assignment fails", async () => {
      // Arrange
      mockUserRepository.findByGoogleId.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleRepository.findByName.mockResolvedValue(mockRole);
      mockUserRepository.create.mockResolvedValue(mockNewUser);
      mockUserRepository.assignRole.mockRejectedValue(
        new Error("Role assignment failed")
      );

      // Act & Assert
      await expect(googleAuthUseCase.execute(mockGoogleUser)).rejects.toThrow(
        new AppException(
          "Error during Google authentication: Role assignment failed",
          500
        )
      );
    });

    it("should throw AppException when email sending fails", async () => {
      // Arrange
      mockUserRepository.findByGoogleId.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(mockUserWithEmail);
      mockUserRepository.update.mockResolvedValue(mockUpdatedUser);
      mockMailService.sendEmailVerifiedConfirmation.mockRejectedValue(
        new Error("Email service error")
      );

      // Act & Assert
      await expect(googleAuthUseCase.execute(mockGoogleUser)).rejects.toThrow(
        new AppException(
          "Error during Google authentication: Email service error",
          500
        )
      );
    });

    it("should rethrow AppException when it's already an AppException", async () => {
      // Arrange
      const appException = new AppException("Custom error", 400);
      mockUserRepository.findByGoogleId.mockRejectedValue(appException);

      // Act & Assert
      await expect(googleAuthUseCase.execute(mockGoogleUser)).rejects.toThrow(
        appException
      );
    });
  });
});
