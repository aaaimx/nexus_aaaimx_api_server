import { IClubRepository } from "@/domain/repositories";
import { Club } from "@/domain/entities";
import AppException from "@/shared/utils/exception.util";
import logger from "@/infrastructure/logger";

export class GetClubsCatalogUseCase {
  constructor(private readonly clubRepository: IClubRepository) {}

  async execute(): Promise<Club[]> {
    try {
      logger.info("Getting clubs catalog");

      const clubs = await this.clubRepository.findAll();

      logger.info(`Successfully retrieved ${clubs?.length || 0} clubs`);

      return clubs || [];
    } catch (error) {
      logger.error("Error getting clubs catalog", { error });

      if (error instanceof AppException) {
        throw error;
      }

      throw new AppException("Failed to retrieve clubs catalog", 500);
    }
  }
}
