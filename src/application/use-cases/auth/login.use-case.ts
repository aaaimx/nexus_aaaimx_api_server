import { IUserRepository } from "@/domain/repositories/user.repository";
import { JwtService } from "@/infrastructure/external-services";
import { PasswordService } from "@/infrastructure/external-services";
import { SessionService } from "@/application/services/auth/session.service";
import { LoginInput, LoginOutput } from "@/interfaces/types/auth.types";
import AppException from "@/shared/utils/exception.util";

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly sessionService: SessionService
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    try {
      const { email, password } = input;

      // Find user by email
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        throw new AppException("Invalid credentials", 401);
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AppException("Account is deactivated", 401);
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        throw new AppException("Email not verified", 403);
      }

      // Verify password
      if (!user.password) {
        throw new AppException("Invalid credentials", 401);
      }

      const isPasswordValid = await this.passwordService.compare(
        password,
        user.password
      );

      if (!isPasswordValid) {
        throw new AppException("Invalid credentials", 401);
      }

      // Get user's actual role
      const userRoleId = await this.userRepository.getUserRoleId(user.id);

      if (!userRoleId) {
        throw new AppException("User role not found", 500);
      }

      // Generate tokens
      const tokenPayload = {
        id: user.id,
        email: user.email,
        roleId: userRoleId,
        emailVerified: user.isEmailVerified,
      };

      const accessToken = this.jwtService.generateAccessToken(tokenPayload);
      const refreshToken = this.jwtService.generateRefreshToken(tokenPayload);

      // Update last session date
      await this.sessionService.updateLastSessionDate(user.id);

      return {
        user: {
          id: user.id,
          firstName: user.firstName!,
          lastName: user.lastName!,
          email: user.email,
          birthDate: null, // TODO: Add birthDate to user entity if needed
          emailVerified: user.isEmailVerified,
          roleId: userRoleId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(
        `Error during login: ${(error as Error).message}`,
        500
      );
    }
  }
}
