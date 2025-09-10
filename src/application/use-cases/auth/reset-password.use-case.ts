import { IUserRepository } from "@/domain/repositories/user.repository";
import {
  MailService,
  PasswordService,
} from "@/infrastructure/external-services";
import { ResetPasswordSchemaType } from "@/interfaces/validators/schemas/user/reset-password.schema";
import AppException from "@/shared/utils/exception.util";

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: PasswordService,
    private readonly mailService: MailService
  ) {}

  async execute(input: ResetPasswordSchemaType): Promise<void> {
    try {
      const { email, reset_password_code, new_password } = input;

      const user = await this.userRepository.findByEmail(email as string);

      if (!user) {
        throw new AppException("Invalid or expired reset code", 400);
      }

      if (
        !user.resetPasswordCode ||
        !user.resetPasswordExpires ||
        user.resetPasswordCode !== reset_password_code ||
        new Date() > user.resetPasswordExpires
      ) {
        throw new AppException("Invalid or expired reset code", 400);
      }

      const hashedPassword = await this.passwordService.hash(new_password);

      await this.userRepository.update(user.id, {
        password: hashedPassword,
      });

      // Clear reset password fields after successful password reset
      await this.userRepository.clearResetPasswordFields(user.id);

      await this.mailService.sendPasswordResetSuccessEmail(
        email as string,
        user.firstName
      );
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(
        `Error resetting password: ${(error as Error).message}`,
        500
      );
    }
  }
}
