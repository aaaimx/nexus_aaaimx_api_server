import { IDivisionRepository } from "@/domain/repositories";
import { Division } from "@/domain/entities";
import AppException from "@/shared/utils/exception.util";
import logger from "@/infrastructure/logger";

export class GetDivisionsCatalogUseCase {
  constructor(private readonly divisionRepository: IDivisionRepository) {}

  async execute(): Promise<Division[]> {
    try {
      logger.info("Getting divisions catalog");

      const divisions = await this.divisionRepository.findAll();

      logger.info(`Successfully retrieved ${divisions?.length || 0} divisions`);

      return divisions || [];
    } catch (error) {
      logger.error("Error getting divisions catalog", { error });
      
      if (error instanceof AppException) {
        throw error;
      }
      
      throw new AppException("Failed to retrieve divisions catalog", 500);
    }
  }
}
