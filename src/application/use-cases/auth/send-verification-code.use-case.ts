import { IUserRepository } from "@/domain/repositories/user.repository";
import { VerificationCodeService } from "@/infrastructure/external-services";
import { MailService } from "@/infrastructure/external-services";
import AppException from "@/shared/utils/exception.util";

export interface SendVerificationCodeInput {
  email: string;
}

export interface SendVerificationCodeOutput {
  message: string;
}

export class SendVerificationCodeUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly verificationCodeService: VerificationCodeService,
    private readonly mailService: MailService
  ) {}

  async execute(
    input: SendVerificationCodeInput
  ): Promise<SendVerificationCodeOutput> {
    try {
      // Check if user exists
      const user = await this.userRepository.findByEmail(input.email);

      if (!user) {
        // Return success message even if user doesn't exist for security
        return {
          message:
            "If the email is registered, a verification code has been sent.",
        };
      }

      // Check if user is already verified
      if (user.isEmailVerified) {
        throw new AppException("Email is already verified", 400);
      }

      // Generate new verification code
      const verificationCode = this.verificationCodeService.generateCode();

      // Update user with new verification code
      await this.userRepository.update(user.id, {
        verificationCode: verificationCode.code,
        verificationExpires: verificationCode.expiresAt,
      });

      // Send verification email
      await this.mailService.sendVerificationEmail(
        input.email,
        verificationCode.code,
        user.firstName
      );

      return {
        message:
          "If the email is registered, a verification code has been sent.",
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(
        `Error sending verification code: ${(error as Error).message}`,
        500
      );
    }
  }
}
