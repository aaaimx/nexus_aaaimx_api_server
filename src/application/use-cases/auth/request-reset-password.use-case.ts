import { IUserRepository } from "@/domain/repositories/user.repository";
import {
  MailService,
  VerificationCodeService,
} from "@/infrastructure/external-services";
import { RequestResetPasswordSchemaType } from "@/interfaces/validators/schemas/user/request-reset-password.schema";
import AppException from "@/shared/utils/exception.util";

export class RequestResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly verificationCodeService: VerificationCodeService,
    private readonly mailService: MailService
  ) {}

  async execute(input: RequestResetPasswordSchemaType): Promise<void> {
    try {
      const { email } = input;

      const user = await this.userRepository.findByEmail(email);

      // This is important for security to avoid email enumeration attacks
      if (!user) {
        return; // Early return with no error
      }

      const { code: resetPasswordCode, expiresAt: resetPasswordExpires } =
        this.verificationCodeService.generateCode(6, 60);

      await this.userRepository.update(user.id, {
        resetPasswordCode,
        resetPasswordExpires,
      });

      await this.mailService.sendPasswordResetEmail(
        email,
        resetPasswordCode,
        user.firstName
      );
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(
        `Error processing password reset request: ${(error as Error).message}`,
        500
      );
    }
  }
}
