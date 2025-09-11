import { Request, Response } from "express";
import { GetDivisionsCatalogUseCase } from "@/application/use-cases/division/get-divisions-catalog.use-case";
import { IDivisionRepository } from "@/domain/repositories";
import AppException from "@/shared/utils/exception.util";
import logger from "@/infrastructure/logger";

export class DivisionController {
  private getDivisionsCatalogUseCase: GetDivisionsCatalogUseCase;

  constructor(divisionRepository: IDivisionRepository) {
    this.getDivisionsCatalogUseCase = new GetDivisionsCatalogUseCase(
      divisionRepository
    );
  }

  /**
   * @route   GET /api/divisions
   * @desc    Get divisions catalog
   * @access  Public
   */
  async getDivisionsCatalog(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Getting divisions catalog", {
        userAgent: req.get("User-Agent"),
        ip: req.ip,
      });

      const divisions = await this.getDivisionsCatalogUseCase.execute();

      res.status(200).json({
        success: true,
        message: "Divisions catalog retrieved successfully",
        data: divisions,
        status: 200,
      });
    } catch (error) {
      logger.error("Error in getDivisionsCatalog controller", {
        error,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
      });

      if (error instanceof AppException) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          data: null,
          status: error.statusCode,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
        data: null,
        status: 500,
      });
    }
  }
}
