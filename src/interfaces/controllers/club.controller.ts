import { Request, Response } from "express";
import { GetClubsCatalogUseCase } from "@/application/use-cases/club/get-clubs-catalog.use-case";
import { CreateClubUseCase } from "@/application/use-cases/club/create-club.use-case";
import { UpdateClubUseCase } from "@/application/use-cases/club/update-club.use-case";
import { DeleteClubUseCase } from "@/application/use-cases/club/delete-club.use-case";
import { IClubRepository } from "@/domain/repositories";
import AppException from "@/shared/utils/exception.util";
import logger from "@/infrastructure/logger";
import { CreateClubRequest } from "@/interfaces/validators/schemas/club";
import {
  UpdateClubRequest,
  UpdateClubParams,
} from "@/interfaces/validators/schemas/club";
import { ClubParams } from "@/interfaces/validators/schemas/club";

export class ClubController {
  private getClubsCatalogUseCase: GetClubsCatalogUseCase;
  private createClubUseCase: CreateClubUseCase;
  private updateClubUseCase: UpdateClubUseCase;
  private deleteClubUseCase: DeleteClubUseCase;

  constructor(clubRepository: IClubRepository) {
    this.getClubsCatalogUseCase = new GetClubsCatalogUseCase(clubRepository);
    this.createClubUseCase = new CreateClubUseCase(clubRepository);
    this.updateClubUseCase = new UpdateClubUseCase(clubRepository);
    this.deleteClubUseCase = new DeleteClubUseCase(clubRepository);
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

  /**
   * @route   POST /api/clubs
   * @desc    Create a new club
   * @access  Private (committee and president only)
   */
  async createClub(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Creating new club", {
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        userId: req.user?.id,
        clubData: req.body,
      });

      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
          data: null,
          status: 401,
        });
        return;
      }

      const clubData = req.body as CreateClubRequest;
      const userRoles = (req.user as any).roles || [];

      const createRequest = {
        name: clubData.name,
        ...(clubData.description !== undefined && {
          description: clubData.description,
        }),
        ...(clubData.logoUrl !== undefined && { logoUrl: clubData.logoUrl }),
        userRoles,
      };
      const result = await this.createClubUseCase.execute(createRequest);

      res.status(201).json({
        success: true,
        message: "Club created successfully",
        data: result.club,
        status: 201,
      });
    } catch (error) {
      logger.error("Error in createClub controller", {
        error,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        userId: req.user?.id,
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

  /**
   * @route   PUT /api/clubs/:id
   * @desc    Update an existing club
   * @access  Private (committee and president only)
   */
  async updateClub(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Updating club", {
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        userId: req.user?.id,
        clubId: req.params["id"],
        updateData: req.body,
      });

      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
          data: null,
          status: 401,
        });
        return;
      }

      const { id } = req.params as UpdateClubParams;
      const updateData = req.body as UpdateClubRequest;
      const userRoles = (req.user as any).roles || [];

      const updateRequest = {
        id,
        ...(updateData.name !== undefined && { name: updateData.name }),
        ...(updateData.description !== undefined && {
          description: updateData.description,
        }),
        ...(updateData.logoUrl !== undefined && {
          logoUrl: updateData.logoUrl,
        }),
        userRoles,
      };
      const result = await this.updateClubUseCase.execute(updateRequest);

      res.status(200).json({
        success: true,
        message: "Club updated successfully",
        data: result.club,
        status: 200,
      });
    } catch (error) {
      logger.error("Error in updateClub controller", {
        error,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        userId: req.user?.id,
        clubId: req.params["id"],
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

  /**
   * @route   DELETE /api/clubs/:id
   * @desc    Delete a club
   * @access  Private (committee and president only)
   */
  async deleteClub(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Deleting club", {
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        userId: req.user?.id,
        clubId: req.params["id"],
      });

      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
          data: null,
          status: 401,
        });
        return;
      }

      const { id } = req.params as ClubParams;
      const userRoles = (req.user as any).roles || [];

      await this.deleteClubUseCase.execute({
        id,
        userRoles,
      });

      res.status(200).json({
        success: true,
        message: "Club deleted successfully",
        data: null,
        status: 200,
      });
    } catch (error) {
      logger.error("Error in deleteClub controller", {
        error,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        userId: req.user?.id,
        clubId: req.params["id"],
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
