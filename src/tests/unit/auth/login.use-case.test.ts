import { LoginUseCase } from "@/application/use-cases/auth/login.use-case";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { JwtService } from "@/infrastructure/external-services";
import { PasswordService } from "@/infrastructure/external-services";
import { SessionService } from "@/application/services/auth/session.service";
import DefaultRoleService from "@/application/services/auth/default-role.service";
import { User } from "@/domain/entities/user.entity";
import { Role } from "@/domain/entities/role.entity";
import AppException from "@/shared/utils/exception.util";
import {
  createMockUserRepository,
  createMockJwtService,
  createMockPasswordService,
  createMockSessionService,
  createMockUser,
  createMockRole,
} from "@/tests/test-helpers";

// Mock dependencies
jest.mock("@/application/services/auth/default-role.service");
jest.mock("@/application/services/auth/session.service");

describe("LoginUseCase", () => {
  let loginUseCase: LoginUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockPasswordService: jest.Mocked<PasswordService>;
  let mockSessionService: jest.Mocked<SessionService>;
  let mockDefaultRoleService: jest.Mocked<DefaultRoleService>;

  const mockUser: User = createMockUser({
    password: "hashed-password",
  });

  const mockRole: Role = createMockRole();

  beforeEach(() => {
    // Create mocks
    mockUserRepository = createMockUserRepository();
    mockJwtService = createMockJwtService();
    mockPasswordService = createMockPasswordService();
    mockSessionService = createMockSessionService();

    mockDefaultRoleService = {
      getDefaultRole: jest.fn(),
    } as any;

    // Create use case instance
    loginUseCase = new LoginUseCase(
      mockUserRepository,
      mockJwtService,
      mockPasswordService,
      mockSessionService,
      mockDefaultRoleService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully login with valid credentials", async () => {
      // Arrange
      const input = { email: "test@example.com", password: "password123" };
      const accessToken = "access-token";
      const refreshToken = "refresh-token";

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.compare.mockResolvedValue(true);
      mockDefaultRoleService.getDefaultRole.mockResolvedValue(mockRole);
      mockJwtService.generateAccessToken.mockReturnValue(accessToken);
      mockJwtService.generateRefreshToken.mockReturnValue(refreshToken);
      mockSessionService.updateLastSessionDate.mockResolvedValue();

      // Act
      const result = await loginUseCase.execute(input);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(input.email);
      expect(mockPasswordService.compare).toHaveBeenCalledWith(
        input.password,
        mockUser.password
      );
      expect(mockDefaultRoleService.getDefaultRole).toHaveBeenCalled();
      expect(mockJwtService.generateAccessToken).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        roleId: mockRole.id,
        emailVerified: mockUser.isEmailVerified,
      });
      expect(mockJwtService.generateRefreshToken).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        roleId: mockRole.id,
        emailVerified: mockUser.isEmailVerified,
      });
      expect(mockSessionService.updateLastSessionDate).toHaveBeenCalledWith(
        mockUser.id
      );

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          email: mockUser.email,
          birthDate: null,
          emailVerified: mockUser.isEmailVerified,
          roleId: mockRole.id,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    });

    it("should throw AppException when user is not found", async () => {
      // Arrange
      const input = {
        email: "nonexistent@example.com",
        password: "password123",
      };
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(loginUseCase.execute(input)).rejects.toThrow(
        new AppException("Invalid credentials", 401)
      );
    });

    it("should throw AppException when user is inactive", async () => {
      // Arrange
      const input = { email: "test@example.com", password: "password123" };
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserRepository.findByEmail.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(loginUseCase.execute(input)).rejects.toThrow(
        new AppException("Account is deactivated", 401)
      );
    });

    it("should throw AppException when email is not verified", async () => {
      // Arrange
      const input = { email: "test@example.com", password: "password123" };
      const unverifiedUser = { ...mockUser, isEmailVerified: false };
      mockUserRepository.findByEmail.mockResolvedValue(unverifiedUser);

      // Act & Assert
      await expect(loginUseCase.execute(input)).rejects.toThrow(
        new AppException("Email not verified", 403)
      );
    });

    it("should throw AppException when user has no password", async () => {
      // Arrange
      const input = { email: "test@example.com", password: "password123" };
      const userWithoutPassword = createMockUser();
      delete userWithoutPassword.password;
      mockUserRepository.findByEmail.mockResolvedValue(userWithoutPassword);

      // Act & Assert
      await expect(loginUseCase.execute(input)).rejects.toThrow(
        new AppException("Invalid credentials", 401)
      );
    });

    it("should throw AppException when password is invalid", async () => {
      // Arrange
      const input = { email: "test@example.com", password: "wrongpassword" };
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(loginUseCase.execute(input)).rejects.toThrow(
        new AppException("Invalid credentials", 401)
      );
    });

    it("should throw AppException when an unexpected error occurs", async () => {
      // Arrange
      const input = { email: "test@example.com", password: "password123" };
      mockUserRepository.findByEmail.mockRejectedValue(
        new Error("Database error")
      );

      // Act & Assert
      await expect(loginUseCase.execute(input)).rejects.toThrow(
        new AppException("Error during login: Database error", 500)
      );
    });

    it("should rethrow AppException when it's already an AppException", async () => {
      // Arrange
      const input = { email: "test@example.com", password: "password123" };
      const appException = new AppException("Custom error", 400);
      mockUserRepository.findByEmail.mockRejectedValue(appException);

      // Act & Assert
      await expect(loginUseCase.execute(input)).rejects.toThrow(appException);
    });
  });
});
