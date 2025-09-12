import { IUserRepository } from "@/domain/repositories/user.repository";
import AppException from "@/shared/utils/exception.util";

export interface GetAccountInput {
  userId: string;
}

export interface GetAccountOutput {
  id: string;
  email: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  bio?: string | undefined;
  photoUrl?: string | undefined;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | undefined;
  allowNotifications: boolean;
  roleId?: string | undefined;
  divisions?: string[] | undefined;
  clubs?: string[] | undefined;
}

export class GetAccountUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: GetAccountInput): Promise<GetAccountOutput> {
    try {
      const user = await this.userRepository.findById(input.userId);

      if (!user) {
        throw new AppException("User not found", 404);
      }

      if (!user.isActive) {
        throw new AppException("Account is deactivated", 403);
      }

      const roleId = await this.userRepository.getUserRoleId(user.id);
      const divisions = await this.userRepository.getUserDivisions(user.id);
      const clubs = await this.userRepository.getUserClubs(user.id);

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        bio: user.bio || undefined,
        photoUrl: user.photoUrl || undefined,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt || undefined,
        allowNotifications: user.allowNotifications,
        roleId: roleId || undefined,
        divisions: divisions.length > 0 ? divisions : undefined,
        clubs: clubs.length > 0 ? clubs : undefined,
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(
        `Error retrieving account information: ${(error as Error).message}`,
        500
      );
    }
  }
}
