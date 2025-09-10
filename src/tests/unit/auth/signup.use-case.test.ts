import {
  SignupUseCase,
  SignupInput,
} from "@/application/use-cases/auth/signup.use-case";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { DefaultRoleService } from "@/application/services/auth";
import { UserValidationService } from "@/application/services/auth";
import {
  PasswordService,
  VerificationCodeService,
  MailService,
} from "@/infrastructure/external-services";
import { User } from "@/domain/entities/user.entity";
import { Role } from "@/domain/entities/role.entity";
import AppException from "@/shared/utils/exception.util";
import {
  createMockUserRepository,
  createMockPasswordService,
  createMockVerificationCodeService,
  createMockMailService,
  createMockUser,
  createMockRole,
} from "@/tests/test-helpers";

// Mock dependencies
jest.mock("@/application/services/auth");
jest.mock("@/infrastructure/external-services");

describe("SignupUseCase", () => {
  let signupUseCase: SignupUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordService: jest.Mocked<PasswordService>;
  let mockVerificationCodeService: jest.Mocked<VerificationCodeService>;
  let mockMailService: jest.Mocked<MailService>;
  let mockDefaultRoleService: jest.Mocked<DefaultRoleService>;
  let mockUserValidationService: jest.Mocked<UserValidationService>;

  const mockSignupInput: SignupInput = {
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    password: "password123",
    birth_date: "1990-01-01",
    bio: "Test bio",
  };

  const mockCreatedUser: User = createMockUser({
    email: "john.doe@example.com",
    bio: "Test bio",
    isEmailVerified: false,
    verificationCode: "123456",
    verificationExpires: new Date("2024-01-02"),
  });

  const mockRole: Role = createMockRole();

  const mockVerificationCode = {
    code: "123456",
    expiresAt: new Date("2024-01-02"),
  };

  beforeEach(() => {
    // Create mocks
    mockUserRepository = createMockUserRepository();
    mockPasswordService = createMockPasswordService();
    mockVerificationCodeService = createMockVerificationCodeService();
    mockMailService = createMockMailService();

    mockDefaultRoleService = {
      getDefaultRole: jest.fn(),
    } as any;

    mockUserValidationService = {
      validateEmailNotExists: jest.fn(),
    } as any;

    // Create use case instance
    signupUseCase = new SignupUseCase(
      mockUserRepository,
      mockPasswordService,
      mockVerificationCodeService,
      mockMailService,
      mockDefaultRoleService,
      mockUserValidationService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully create a new user", async () => {
      // Arrange
      const hashedPassword = "hashed-password";
      const expectedUserData = {
        firstName: mockSignupInput.first_name,
        lastName: mockSignupInput.last_name,
        email: mockSignupInput.email,
        password: hashedPassword,
        bio: mockSignupInput.bio,
        isEmailVerified: false,
        isActive: true,
        allowNotifications: true,
        verificationCode: mockVerificationCode.code,
        verificationExpires: mockVerificationCode.expiresAt,
      };

      mockUserValidationService.validateEmailNotExists.mockResolvedValue();
      mockDefaultRoleService.getDefaultRole.mockResolvedValue(mockRole);
      mockPasswordService.hash.mockResolvedValue(hashedPassword);
      mockVerificationCodeService.generateCode.mockReturnValue(
        mockVerificationCode
      );
      mockUserRepository.create.mockResolvedValue(mockCreatedUser);
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);

      // Act
      const result = await signupUseCase.execute(mockSignupInput);

      // Assert
      expect(
        mockUserValidationService.validateEmailNotExists
      ).toHaveBeenCalledWith(mockSignupInput.email);
      expect(mockDefaultRoleService.getDefaultRole).toHaveBeenCalled();
      expect(mockPasswordService.hash).toHaveBeenCalledWith(
        mockSignupInput.password
      );
      expect(mockVerificationCodeService.generateCode).toHaveBeenCalled();
      expect(mockUserRepository.create).toHaveBeenCalledWith(expectedUserData);
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith(
        mockCreatedUser.email,
        mockVerificationCode.code,
        mockCreatedUser.firstName
      );

      expect(result).toEqual({
        id: mockCreatedUser.id,
        firstName: mockCreatedUser.firstName,
        lastName: mockCreatedUser.lastName,
        email: mockCreatedUser.email,
        birthDate: mockSignupInput.birth_date,
        bio: mockCreatedUser.bio,
        photoUrl: mockCreatedUser.photoUrl,
        emailVerified: mockCreatedUser.isEmailVerified,
        roleId: mockRole.id,
        createdAt: mockCreatedUser.createdAt,
        updatedAt: mockCreatedUser.updatedAt,
      });
    });

    it("should handle signup without bio", async () => {
      // Arrange
      const inputWithoutBio = { ...mockSignupInput };
      delete inputWithoutBio.bio;
      const hashedPassword = "hashed-password";
      const expectedUserData = {
        firstName: inputWithoutBio.first_name,
        lastName: inputWithoutBio.last_name,
        email: inputWithoutBio.email,
        password: hashedPassword,
        bio: undefined,
        isEmailVerified: false,
        isActive: true,
        allowNotifications: true,
        verificationCode: mockVerificationCode.code,
        verificationExpires: mockVerificationCode.expiresAt,
      };

      mockUserValidationService.validateEmailNotExists.mockResolvedValue();
      mockDefaultRoleService.getDefaultRole.mockResolvedValue(mockRole);
      mockPasswordService.hash.mockResolvedValue(hashedPassword);
      mockVerificationCodeService.generateCode.mockReturnValue(
        mockVerificationCode
      );
      const userWithoutBio = createMockUser({
        email: "john.doe@example.com",
        isEmailVerified: false,
        verificationCode: "123456",
        verificationExpires: new Date("2024-01-02"),
      });
      delete userWithoutBio.bio;
      mockUserRepository.create.mockResolvedValue(userWithoutBio);
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);

      // Act
      const result = await signupUseCase.execute(inputWithoutBio);

      // Assert
      expect(mockUserRepository.create).toHaveBeenCalledWith(expectedUserData);
      expect(result.bio).toBeUndefined();
    });

    it("should throw AppException when email validation fails", async () => {
      // Arrange
      const appException = new AppException("Email already exists", 400);
      mockUserValidationService.validateEmailNotExists.mockRejectedValue(
        appException
      );

      // Act & Assert
      await expect(signupUseCase.execute(mockSignupInput)).rejects.toThrow(
        appException
      );
    });

    it("should throw AppException when default role is not found", async () => {
      // Arrange
      mockUserValidationService.validateEmailNotExists.mockResolvedValue();
      mockDefaultRoleService.getDefaultRole.mockRejectedValue(
        new Error("Role not found")
      );

      // Act & Assert
      await expect(signupUseCase.execute(mockSignupInput)).rejects.toThrow(
        new AppException("Error during signup: Role not found", 500)
      );
    });

    it("should throw AppException when password hashing fails", async () => {
      // Arrange
      mockUserValidationService.validateEmailNotExists.mockResolvedValue();
      mockDefaultRoleService.getDefaultRole.mockResolvedValue(mockRole);
      mockPasswordService.hash.mockRejectedValue(new Error("Hashing failed"));

      // Act & Assert
      await expect(signupUseCase.execute(mockSignupInput)).rejects.toThrow(
        new AppException("Error during signup: Hashing failed", 500)
      );
    });

    it("should throw AppException when user creation fails", async () => {
      // Arrange
      const hashedPassword = "hashed-password";
      mockUserValidationService.validateEmailNotExists.mockResolvedValue();
      mockDefaultRoleService.getDefaultRole.mockResolvedValue(mockRole);
      mockPasswordService.hash.mockResolvedValue(hashedPassword);
      mockVerificationCodeService.generateCode.mockReturnValue(
        mockVerificationCode
      );
      mockUserRepository.create.mockRejectedValue(new Error("Database error"));

      // Act & Assert
      await expect(signupUseCase.execute(mockSignupInput)).rejects.toThrow(
        new AppException("Error during signup: Database error", 500)
      );
    });

    it("should throw AppException when email sending fails", async () => {
      // Arrange
      const hashedPassword = "hashed-password";
      mockUserValidationService.validateEmailNotExists.mockResolvedValue();
      mockDefaultRoleService.getDefaultRole.mockResolvedValue(mockRole);
      mockPasswordService.hash.mockResolvedValue(hashedPassword);
      mockVerificationCodeService.generateCode.mockReturnValue(
        mockVerificationCode
      );
      mockUserRepository.create.mockResolvedValue(mockCreatedUser);
      mockMailService.sendVerificationEmail.mockRejectedValue(
        new Error("Email service error")
      );

      // Act & Assert
      await expect(signupUseCase.execute(mockSignupInput)).rejects.toThrow(
        new AppException("Error during signup: Email service error", 500)
      );
    });

    it("should rethrow AppException when it's already an AppException", async () => {
      // Arrange
      const appException = new AppException("Custom validation error", 400);
      mockUserValidationService.validateEmailNotExists.mockRejectedValue(
        appException
      );

      // Act & Assert
      await expect(signupUseCase.execute(mockSignupInput)).rejects.toThrow(
        appException
      );
    });
  });
});
