import { IUserRepository } from "@/domain/repositories/user.repository";
import AppException from "@/shared/utils/exception.util";

export default class UserValidationService {
  constructor(private readonly userRepository: IUserRepository) {}

  async validateEmailNotExists(email: string): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppException("Email already registered", 400);
    }
  }
}
