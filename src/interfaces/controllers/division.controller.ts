import { Request, Response } from "express";
import { GetDivisionsCatalogUseCase } from "@/application/use-cases/division/get-divisions-catalog.use-case";
import { CreateDivisionUseCase } from "@/application/use-cases/division/create-division.use-case";
import { UpdateDivisionUseCase } from "@/application/use-cases/division/update-division.use-case";
import { DeleteDivisionUseCase } from "@/application/use-cases/division/delete-division.use-case";
import { IDivisionRepository } from "@/domain/repositories";
import AppException from "@/shared/utils/exception.util";
import logger from "@/infrastructure/logger";
import { CreateDivisionRequest } from "@/interfaces/validators/schemas/division";
import {
  UpdateDivisionRequest,
  UpdateDivisionParams,
} from "@/interfaces/validators/schemas/division";
import { DivisionParams } from "@/interfaces/validators/schemas/division";

export class DivisionController {
  private getDivisionsCatalogUseCase: GetDivisionsCatalogUseCase;
  private createDivisionUseCase: CreateDivisionUseCase;
  private updateDivisionUseCase: UpdateDivisionUseCase;
  private deleteDivisionUseCase: DeleteDivisionUseCase;

  constructor(divisionRepository: IDivisionRepository) {
    this.getDivisionsCatalogUseCase = new GetDivisionsCatalogUseCase(
      divisionRepository
    );
    this.createDivisionUseCase = new CreateDivisionUseCase(divisionRepository);
    this.updateDivisionUseCase = new UpdateDivisionUseCase(divisionRepository);
    this.deleteDivisionUseCase = new DeleteDivisionUseCase(divisionRepository);
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
   * @route   POST /api/divisions
   * @desc    Create a new division
   * @access  Private (committee and president only)
   */
  async createDivision(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Creating new division", {
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        userId: req.user?.id,
        divisionData: req.body,
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

      const divisionData = req.body as CreateDivisionRequest;
      const userRoles = (req.user as any).roles || [];

      const createRequest = {
        name: divisionData.name,
        ...(divisionData.description !== undefined && {
          description: divisionData.description,
        }),
        ...(divisionData.logoUrl !== undefined && {
          logoUrl: divisionData.logoUrl,
        }),
        userRoles,
      };
      const result = await this.createDivisionUseCase.execute(createRequest);

      res.status(201).json({
        success: true,
        message: "Division created successfully",
        data: result.division,
        status: 201,
      });
    } catch (error) {
      logger.error("Error in createDivision controller", {
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
   * @route   PUT /api/divisions/:id
   * @desc    Update an existing division
   * @access  Private (committee and president only)
   */
  async updateDivision(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Updating division", {
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        userId: req.user?.id,
        divisionId: req.params["id"],
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

      const { id } = req.params as UpdateDivisionParams;
      const updateData = req.body as UpdateDivisionRequest;
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
      const result = await this.updateDivisionUseCase.execute(updateRequest);

      res.status(200).json({
        success: true,
        message: "Division updated successfully",
        data: result.division,
        status: 200,
      });
    } catch (error) {
      logger.error("Error in updateDivision controller", {
        error,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        userId: req.user?.id,
        divisionId: req.params["id"],
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
   * @route   DELETE /api/divisions/:id
   * @desc    Delete a division
   * @access  Private (committee and president only)
   */
  async deleteDivision(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Deleting division", {
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        userId: req.user?.id,
        divisionId: req.params["id"],
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

      const { id } = req.params as DivisionParams;
      const userRoles = (req.user as any).roles || [];

      await this.deleteDivisionUseCase.execute({
        id,
        userRoles,
      });

      res.status(200).json({
        success: true,
        message: "Division deleted successfully",
        data: null,
        status: 200,
      });
    } catch (error) {
      logger.error("Error in deleteDivision controller", {
        error,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        userId: req.user?.id,
        divisionId: req.params["id"],
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
