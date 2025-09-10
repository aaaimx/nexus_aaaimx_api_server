import { IUserRepository } from "@/domain/repositories/user.repository";
import logger from "@/infrastructure/logger";
import { TimezoneUtil } from "@/shared/utils/timezone.util";

export class SessionService {
  constructor(private readonly userRepository: IUserRepository) {}

  async updateLastSessionDate(userId: string): Promise<void> {
    try {
      const currentDate = TimezoneUtil.nowInMexico();

      await this.userRepository.update(userId, {
        lastLoginAt: currentDate,
      });
    } catch (error) {
      // Log the error but don't throw to avoid breaking the authentication flow
      // The session update is not critical for authentication to work
      logger.error(
        `Error updating last session date for user ${userId}: ${error}`
      );
    }
  }
}
