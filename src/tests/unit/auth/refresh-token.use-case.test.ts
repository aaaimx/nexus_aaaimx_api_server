import { RefreshTokenUseCase } from "@/application/use-cases/auth/refresh-token.use-case";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { JwtService } from "@/infrastructure/external-services";
import { RefreshTokenInput, AuthTokens } from "@/interfaces/types/auth.types";
import { User } from "@/domain/entities/user.entity";
import AppException from "@/shared/utils/exception.util";
import {
  createMockUserRepository,
  createMockJwtService,
  createMockUser,
} from "@/tests/test-helpers";

// Mock dependencies
jest.mock("@/infrastructure/external-services");

describe("RefreshTokenUseCase", () => {
  let refreshTokenUseCase: RefreshTokenUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockJwtService: jest.Mocked<JwtService>;

  const mockRefreshInput: RefreshTokenInput = {
    refresh_token: "valid-refresh-token",
  };

  const mockDecodedToken = {
    id: "user-123",
    email: "test@example.com",
    roleId: "role-123",
    emailVerified: true,
  };

  const mockUser: User = createMockUser();

  const mockTokens: AuthTokens = {
    accessToken: "new-access-token",
    refreshToken: "new-refresh-token",
  };

  beforeEach(() => {
    // Create mocks
    mockUserRepository = createMockUserRepository();
    mockJwtService = createMockJwtService();

    // Create use case instance
    refreshTokenUseCase = new RefreshTokenUseCase(
      mockUserRepository,
      mockJwtService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully refresh tokens with valid refresh token", async () => {
      // Arrange
      mockJwtService.verifyRefreshToken.mockReturnValue(mockDecodedToken);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockJwtService.generateAccessToken.mockReturnValue(
        mockTokens.accessToken
      );
      mockJwtService.generateRefreshToken.mockReturnValue(
        mockTokens.refreshToken
      );

      // Act
      const result = await refreshTokenUseCase.execute(mockRefreshInput);

      // Assert
      expect(mockJwtService.verifyRefreshToken).toHaveBeenCalledWith(
        mockRefreshInput.refresh_token
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        mockDecodedToken.id
      );
      expect(mockJwtService.generateAccessToken).toHaveBeenCalledWith({
        id: mockDecodedToken.id,
        email: mockDecodedToken.email,
        roleId: mockDecodedToken.roleId,
        emailVerified: mockUser.isEmailVerified,
      });
      expect(mockJwtService.generateRefreshToken).toHaveBeenCalledWith({
        id: mockDecodedToken.id,
        email: mockDecodedToken.email,
        roleId: mockDecodedToken.roleId,
        emailVerified: mockUser.isEmailVerified,
      });

      expect(result).toEqual(mockTokens);
    });

    it("should throw AppException when refresh token is invalid", async () => {
      // Arrange
      mockJwtService.verifyRefreshToken.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      // Act & Assert
      await expect(
        refreshTokenUseCase.execute(mockRefreshInput)
      ).rejects.toThrow(
        new AppException("Error refreshing token: Invalid token", 401)
      );
    });

    it("should throw AppException when refresh token is missing user ID", async () => {
      // Arrange
      const invalidDecodedToken = { ...mockDecodedToken, id: "" };
      mockJwtService.verifyRefreshToken.mockReturnValue(invalidDecodedToken);

      // Act & Assert
      await expect(
        refreshTokenUseCase.execute(mockRefreshInput)
      ).rejects.toThrow(
        new AppException("Invalid refresh token: missing user data", 401)
      );
    });

    it("should throw AppException when refresh token is missing email", async () => {
      // Arrange
      const invalidDecodedToken = { ...mockDecodedToken, email: "" };
      mockJwtService.verifyRefreshToken.mockReturnValue(invalidDecodedToken);

      // Act & Assert
      await expect(
        refreshTokenUseCase.execute(mockRefreshInput)
      ).rejects.toThrow(
        new AppException("Invalid refresh token: missing user data", 401)
      );
    });

    it("should throw AppException when refresh token is missing role ID", async () => {
      // Arrange
      const invalidDecodedToken = { ...mockDecodedToken, roleId: "" };
      mockJwtService.verifyRefreshToken.mockReturnValue(invalidDecodedToken);

      // Act & Assert
      await expect(
        refreshTokenUseCase.execute(mockRefreshInput)
      ).rejects.toThrow(
        new AppException("Invalid refresh token: missing user data", 401)
      );
    });

    it("should throw AppException when user is not found", async () => {
      // Arrange
      mockJwtService.verifyRefreshToken.mockReturnValue(mockDecodedToken);
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        refreshTokenUseCase.execute(mockRefreshInput)
      ).rejects.toThrow(new AppException("User not found", 404));
    });

    it("should throw AppException when user lookup fails", async () => {
      // Arrange
      mockJwtService.verifyRefreshToken.mockReturnValue(mockDecodedToken);
      mockUserRepository.findById.mockRejectedValue(
        new Error("Database error")
      );

      // Act & Assert
      await expect(
        refreshTokenUseCase.execute(mockRefreshInput)
      ).rejects.toThrow(
        new AppException("Error refreshing token: Database error", 401)
      );
    });

    it("should throw AppException when token generation fails", async () => {
      // Arrange
      mockJwtService.verifyRefreshToken.mockReturnValue(mockDecodedToken);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockJwtService.generateAccessToken.mockImplementation(() => {
        throw new Error("Token generation failed");
      });

      // Act & Assert
      await expect(
        refreshTokenUseCase.execute(mockRefreshInput)
      ).rejects.toThrow(
        new AppException("Error refreshing token: Token generation failed", 401)
      );
    });

    it("should use current user email verification status in token payload", async () => {
      // Arrange
      const unverifiedUser = { ...mockUser, isEmailVerified: false };
      mockJwtService.verifyRefreshToken.mockReturnValue(mockDecodedToken);
      mockUserRepository.findById.mockResolvedValue(unverifiedUser);
      mockJwtService.generateAccessToken.mockReturnValue(
        mockTokens.accessToken
      );
      mockJwtService.generateRefreshToken.mockReturnValue(
        mockTokens.refreshToken
      );

      // Act
      await refreshTokenUseCase.execute(mockRefreshInput);

      // Assert
      expect(mockJwtService.generateAccessToken).toHaveBeenCalledWith({
        id: mockDecodedToken.id,
        email: mockDecodedToken.email,
        roleId: mockDecodedToken.roleId,
        emailVerified: false, // Should use current user status, not token status
      });
      expect(mockJwtService.generateRefreshToken).toHaveBeenCalledWith({
        id: mockDecodedToken.id,
        email: mockDecodedToken.email,
        roleId: mockDecodedToken.roleId,
        emailVerified: false, // Should use current user status, not token status
      });
    });

    it("should rethrow AppException when it's already an AppException", async () => {
      // Arrange
      const appException = new AppException("Custom error", 400);
      mockJwtService.verifyRefreshToken.mockImplementation(() => {
        throw appException;
      });

      // Act & Assert
      await expect(
        refreshTokenUseCase.execute(mockRefreshInput)
      ).rejects.toThrow(appException);
    });

    it("should handle refresh token with null values", async () => {
      // Arrange
      const tokenWithNullValues = {
        id: "user-123",
        email: "test@example.com",
        roleId: "role-123",
        emailVerified: true,
        someOtherField: null,
      };
      mockJwtService.verifyRefreshToken.mockReturnValue(tokenWithNullValues);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockJwtService.generateAccessToken.mockReturnValue(
        mockTokens.accessToken
      );
      mockJwtService.generateRefreshToken.mockReturnValue(
        mockTokens.refreshToken
      );

      // Act
      const result = await refreshTokenUseCase.execute(mockRefreshInput);

      // Assert
      expect(result).toEqual(mockTokens);
    });
  });
});
