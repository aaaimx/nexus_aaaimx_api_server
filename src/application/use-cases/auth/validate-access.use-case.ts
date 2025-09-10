import { IUserRepository } from "@/domain/repositories/user.repository";
import {
  ValidateAccessInput,
  ValidateAccessResult,
} from "@/interfaces/types/auth.types";
import AppException from "@/shared/utils/exception.util";

export class ValidateAccessUseCase {
  constructor(private readonly userRepository: IUserRepository) {
  }

  async execute(input: ValidateAccessInput): Promise<ValidateAccessResult> {
    try {
      const { userId } = input;

      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new AppException("User not found", 401);
      }

      if (!user.isEmailVerified) {
        throw new AppException("Email not verified", 403);
      }

      return {
        isValid: true,
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(
        `Error validating access: ${(error as Error).message}`,
        500
      );
    }
  }
}
