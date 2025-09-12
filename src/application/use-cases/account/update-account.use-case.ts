import { IUserRepository } from "@/domain/repositories/user.repository";
import AppException from "@/shared/utils/exception.util";

export interface UpdateAccountInput {
  userId: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
}

export interface UpdateAccountOutput {
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

export class UpdateAccountUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: UpdateAccountInput): Promise<UpdateAccountOutput> {
    try {
      const user = await this.userRepository.findById(input.userId);

      if (!user) {
        throw new AppException("User not found", 404);
      }

      if (!user.isActive) {
        throw new AppException("Account is deactivated", 403);
      }

      const updateData: Partial<{
        firstName: string;
        lastName: string;
        bio: string;
      }> = {};

      if (input.firstName !== undefined) {
        updateData.firstName = input.firstName;
      }

      if (input.lastName !== undefined) {
        updateData.lastName = input.lastName;
      }

      if (input.bio !== undefined) {
        updateData.bio = input.bio;
      }

      const updatedUser = await this.userRepository.update(
        input.userId,
        updateData
      );

      const roleId = await this.userRepository.getUserRoleId(updatedUser.id);
      const divisions = await this.userRepository.getUserDivisions(
        updatedUser.id
      );
      const clubs = await this.userRepository.getUserClubs(updatedUser.id);

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName || undefined,
        lastName: updatedUser.lastName || undefined,
        bio: updatedUser.bio || undefined,
        photoUrl: updatedUser.photoUrl || undefined,
        isEmailVerified: updatedUser.isEmailVerified,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        lastLoginAt: updatedUser.lastLoginAt || undefined,
        allowNotifications: updatedUser.allowNotifications,
        roleId: roleId || undefined,
        divisions: divisions.length > 0 ? divisions : undefined,
        clubs: clubs.length > 0 ? clubs : undefined,
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(
        `Error updating account information: ${(error as Error).message}`,
        500
      );
    }
  }
}
