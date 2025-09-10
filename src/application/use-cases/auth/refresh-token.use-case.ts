import { IUserRepository } from "@/domain/repositories/user.repository";
import { JwtService } from "@/infrastructure/external-services";
import { AuthTokens, RefreshTokenInput } from "@/interfaces/types/auth.types";
import AppException from "@/shared/utils/exception.util";

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(input: RefreshTokenInput): Promise<AuthTokens> {
    try {
      const { refresh_token } = input;

      const decodedToken = this.jwtService.verifyRefreshToken(refresh_token);

      const userId = decodedToken["id"];
      const email = decodedToken["email"];
      const roleId = decodedToken["roleId"];

      if (!userId || !email || !roleId) {
        throw new AppException("Invalid refresh token: missing user data", 401);
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppException("User not found", 404);
      }

      const tokenPayload = {
        id: userId,
        email,
        roleId,
        emailVerified: user.isEmailVerified,
      };

      const accessToken = this.jwtService.generateAccessToken(tokenPayload);
      const refreshToken = this.jwtService.generateRefreshToken(tokenPayload);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(
        `Error refreshing token: ${(error as Error).message}`,
        401
      );
    }
  }
}
