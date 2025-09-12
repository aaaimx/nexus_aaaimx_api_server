import { Request, Response } from "express";
import { ApiResponse } from "@/shared/utils/api-response.util";
import logger from "@/infrastructure/logger";
import { UploadProfilePhotoUseCase } from "@/application/use-cases/account/upload-profile-photo.use-case";
import { GetAccountUseCase } from "@/application/use-cases/account/get-account.use-case";
import { UpdateAccountUseCase } from "@/application/use-cases/account/update-account.use-case";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { FileStorageService } from "@/infrastructure/external-services";
import AppException from "@/shared/utils/exception.util";

export class AccountController {
  private uploadProfilePhotoUseCase: UploadProfilePhotoUseCase;
  private getAccountUseCase: GetAccountUseCase;
  private updateAccountUseCase: UpdateAccountUseCase;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly fileStorageService: FileStorageService
  ) {
    this.uploadProfilePhotoUseCase = new UploadProfilePhotoUseCase(
      userRepository,
      fileStorageService
    );
    this.getAccountUseCase = new GetAccountUseCase(userRepository);
    this.updateAccountUseCase = new UpdateAccountUseCase(userRepository);
  }

  async uploadProfilePhoto(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        const response = new ApiResponse(
          false,
          "User not authenticated",
          null,
          401
        );
        res.status(401).json(response);
        return;
      }

      if (!req.file) {
        const response = new ApiResponse(false, "No file uploaded", null, 400);
        res.status(400).json(response);
        return;
      }

      const input = {
        userId,
        profilePhoto: req.file,
      };

      const result = await this.uploadProfilePhotoUseCase.execute(input);

      const response = new ApiResponse(
        true,
        result.message,
        { photoUrl: result.photoUrl },
        200
      );

      logger.info("Profile photo uploaded successfully", {
        userId,
        photoUrl: result.photoUrl,
      });

      res.status(200).json(response);
    } catch (error) {
      const errorMessage =
        error instanceof AppException
          ? error.message
          : "Profile photo upload failed";

      logger.error("Profile photo upload failed", {
        error: errorMessage,
        userId: req.user?.id,
      });

      const response = new ApiResponse(
        false,
        errorMessage,
        null,
        error instanceof AppException ? error.status : 500
      );

      res
        .status(error instanceof AppException ? error.status : 500)
        .json(response);
    }
  }

  async getProfilePhoto(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        const response = new ApiResponse(
          false,
          "User not authenticated",
          null,
          401
        );
        res.status(401).json(response);
        return;
      }

      // Get user to check if they have a profile photo
      const user = await this.userRepository.findById(userId);
      if (!user) {
        const response = new ApiResponse(false, "User not found", null, 404);
        res.status(404).json(response);
        return;
      }

      if (!user.photoUrl) {
        const response = new ApiResponse(
          false,
          "Profile photo not found",
          null,
          404
        );
        res.status(404).json(response);
        return;
      }

      // Extract the file path from the URL
      const photoPath = this.extractPathFromUrl(user.photoUrl, userId);
      if (!photoPath) {
        const response = new ApiResponse(false, "Invalid photo URL", null, 400);
        res.status(400).json(response);
        return;
      }

      // Check if file exists
      const fileExists = await this.fileStorageService.fileExists(photoPath);
      if (!fileExists) {
        const response = new ApiResponse(
          false,
          "Profile photo file not found",
          null,
          404
        );
        res.status(404).json(response);
        return;
      }

      // Get the full file path
      const fullPath = this.fileStorageService.getFilePath(photoPath);

      // Set appropriate headers
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "private, max-age=3600"); // Cache for 1 hour
      res.setHeader(
        "Content-Disposition",
        'inline; filename="profile-photo.png"'
      );

      // Send the file
      res.sendFile(fullPath);

      logger.info("Profile photo served successfully", {
        userId,
        photoPath,
      });
    } catch (error) {
      const errorMessage =
        error instanceof AppException
          ? error.message
          : "Failed to serve profile photo";

      logger.error("Failed to serve profile photo", {
        error: errorMessage,
        userId: req.user?.id,
      });

      const response = new ApiResponse(
        false,
        errorMessage,
        null,
        error instanceof AppException ? error.status : 500
      );

      res
        .status(error instanceof AppException ? error.status : 500)
        .json(response);
    }
  }

  async getAccount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        const response = new ApiResponse(
          false,
          "User not authenticated",
          null,
          401
        );
        res.status(401).json(response);
        return;
      }

      const result = await this.getAccountUseCase.execute({ userId });

      const response = new ApiResponse(
        true,
        "Account information retrieved successfully",
        result,
        200
      );

      logger.info("Account information retrieved successfully", {
        userId,
      });

      res.status(200).json(response);
    } catch (error) {
      const errorMessage =
        error instanceof AppException
          ? error.message
          : "Failed to retrieve account information";

      logger.error("Failed to retrieve account information", {
        error: errorMessage,
        userId: req.user?.id,
      });

      const response = new ApiResponse(
        false,
        errorMessage,
        null,
        error instanceof AppException ? error.status : 500
      );

      res
        .status(error instanceof AppException ? error.status : 500)
        .json(response);
    }
  }

  async updateAccount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        const response = new ApiResponse(
          false,
          "User not authenticated",
          null,
          401
        );
        res.status(401).json(response);
        return;
      }

      const { firstName, lastName, bio } = req.body;

      const input = {
        userId,
        firstName,
        lastName,
        bio,
      };

      const result = await this.updateAccountUseCase.execute(input);

      const response = new ApiResponse(
        true,
        "Account information updated successfully",
        result,
        200
      );

      logger.info("Account information updated successfully", {
        userId,
        updatedFields: { firstName, lastName, bio },
      });

      res.status(200).json(response);
    } catch (error) {
      const errorMessage =
        error instanceof AppException
          ? error.message
          : "Failed to update account information";

      logger.error("Failed to update account information", {
        error: errorMessage,
        userId: req.user?.id,
      });

      const response = new ApiResponse(
        false,
        errorMessage,
        null,
        error instanceof AppException ? error.status : 500
      );

      res
        .status(error instanceof AppException ? error.status : 500)
        .json(response);
    }
  }

  /**
   * Extracts the relative path from a full URL
   */
  private extractPathFromUrl(url: string, userId: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Handle API URLs - construct the path using the user's ID
      if (pathname.includes("/api/") && pathname.includes("/profile-photo")) {
        return `users/${userId}/profile/`;
      }

      // Handle static file URLs
      if (pathname.startsWith("/uploads/")) {
        return pathname.substring(9); // Remove "/uploads/"
      }

      return null;
    } catch {
      return null;
    }
  }
}
