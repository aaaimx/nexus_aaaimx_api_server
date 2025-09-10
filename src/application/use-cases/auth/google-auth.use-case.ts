import { User } from "@/domain/entities/user.entity";
import { IRoleRepository } from "@/domain/repositories/role.repository";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { GoogleUserInfo } from "@/infrastructure/external-services/google-oauth.service";
import { MailService } from "@/infrastructure/external-services";
import AppException from "@/shared/utils/exception.util";
import crypto from "crypto";

export class GoogleAuthUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly mailService: MailService,
    private readonly roleRepository: IRoleRepository
  ) {}

  async execute(
    googleUser: GoogleUserInfo
  ): Promise<{ user: User; isNewUser: boolean }> {
    try {
      if (!googleUser.id || !googleUser.email) {
        throw new AppException("Invalid Google user information", 400);
      }

      const existingUser = await this.userRepository.findByGoogleId(
        googleUser.id
      );

      if (existingUser) {
        return { user: existingUser, isNewUser: false };
      }

      const userWithEmail = await this.userRepository.findByEmail(
        googleUser.email
      );

      if (userWithEmail) {
        if (!userWithEmail.googleId) {
          const updatedUser = await this.userRepository.update(
            userWithEmail.id,
            {
              googleId: googleUser.id,
            }
          );

          await this.mailService.sendEmailVerifiedConfirmation(
            updatedUser.email,
            updatedUser.firstName
          );

          return { user: updatedUser, isNewUser: false };
        }
        return { user: userWithEmail, isNewUser: false };
      }

      const defaultRole = await this.roleRepository.findByName("member");

      if (!defaultRole) {
        throw new AppException("Default role not found", 500);
      }

      const userData: Partial<User> = {
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        email: googleUser.email,
        password: crypto.randomUUID(), // Generate a random password for Google auth
        googleId: googleUser.id,
        isEmailVerified: googleUser.verified_email,
        isActive: true,
        allowNotifications: true,
      };

      const createdUser = await this.userRepository.create(userData);

      // Create user-role relationship
      await this.userRepository.assignRole(createdUser.id, defaultRole.id);

      await this.mailService.sendEmailVerifiedConfirmation(
        createdUser.email,
        createdUser.firstName
      );

      return { user: createdUser, isNewUser: true };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(
        `Error during Google authentication: ${(error as Error).message}`,
        500
      );
    }
  }
}
