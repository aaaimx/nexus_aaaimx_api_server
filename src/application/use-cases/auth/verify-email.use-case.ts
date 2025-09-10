import { User } from "@/domain/entities/user.entity";
import { IUserRepository } from "@/domain/repositories/user.repository";
import {
  VerificationCodeService,
  MailService,
} from "@/infrastructure/external-services";
import AppException from "@/shared/utils/exception.util";

export interface VerifyEmailInput {
  email: string;
  verification_code: string;
}

export interface VerifyEmailOutput {
  message: string;
  user: User;
}

export class VerifyEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly verificationCodeService: VerificationCodeService,
    private readonly mailService: MailService
  ) {}

  async execute(input: VerifyEmailInput): Promise<VerifyEmailOutput> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(input.email);

      if (!user) {
        throw new AppException("User not found", 404);
      }

      // Check if email is already verified
      if (user.isEmailVerified) {
        throw new AppException("Email is already verified", 400);
      }

      // Check if verification code exists
      if (!user.verificationCode) {
        throw new AppException("No verification code found for this user", 400);
      }

      // Verify the code (this method also checks expiration)
      const isValidCode = this.verificationCodeService.validateCode(
        input.verification_code,
        user.verificationCode,
        user.verificationExpires
      );

      if (!isValidCode) {
        throw new AppException("Invalid verification code", 400);
      }

      // Update user to mark email as verified
      const updatedUser = await this.userRepository.update(user.id, {
        isEmailVerified: true,
      });

      // Clear verification fields after successful verification
      await this.userRepository.clearVerificationFields(user.id);

      // Send verification success email
      await this.mailService.sendVerificationSuccessEmail(
        input.email,
        updatedUser.firstName
      );

      return {
        message: "Email verified successfully.",
        user: updatedUser,
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(
        `Error verifying email: ${(error as Error).message}`,
        500
      );
    }
  }
}
