import { Request, Response } from "express";
import { GetClubsCatalogUseCase } from "@/application/use-cases/club/get-clubs-catalog.use-case";
import { IClubRepository } from "@/domain/repositories";
import AppException from "@/shared/utils/exception.util";
import logger from "@/infrastructure/logger";

export class ClubController {
  private getClubsCatalogUseCase: GetClubsCatalogUseCase;

  constructor(clubRepository: IClubRepository) {
    this.getClubsCatalogUseCase = new GetClubsCatalogUseCase(clubRepository);
  }

  /**
   * @route   GET /api/clubs
   * @desc    Get clubs catalog
   * @access  Public
   */
  async getClubsCatalog(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Getting clubs catalog", {
        userAgent: req.get("User-Agent"),
        ip: req.ip,
      });

      const clubs = await this.getClubsCatalogUseCase.execute();

      res.status(200).json({
        success: true,
        message: "Clubs catalog retrieved successfully",
        data: clubs,
        status: 200,
      });
    } catch (error) {
      logger.error("Error in getClubsCatalog controller", {
        error,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
      });

      if (error instanceof AppException) {
        res.status(error.status).json({
          success: false,
          message: error.message,
          data: null,
          status: error.status,
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
