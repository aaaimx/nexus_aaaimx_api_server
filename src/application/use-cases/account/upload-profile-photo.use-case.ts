import { IUserRepository } from "@/domain/repositories/user.repository";
import { FileStorageService } from "@/infrastructure/external-services";
import AppException from "@/shared/utils/exception.util";

export interface UploadProfilePhotoInput {
  userId: string;
  profilePhoto: Express.Multer.File;
}

export interface UploadProfilePhotoOutput {
  photoUrl: string;
  message: string;
}

export class UploadProfilePhotoUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly fileStorageService: FileStorageService
  ) {}

  async execute(
    input: UploadProfilePhotoInput
  ): Promise<UploadProfilePhotoOutput> {
    try {
      // Verify user exists
      const user = await this.userRepository.findById(input.userId);
      if (!user) {
        throw new AppException("User not found", 404);
      }

      // Clean up any existing profile photos for this user
      await this.cleanupUserProfilePhotos(input.userId);

      // Save new profile photo
      await this.fileStorageService.saveUserProfilePhoto(
        input.profilePhoto,
        input.userId
      );

      // Generate API URL instead of static file URL
      const photoUrl = this.generateApiPhotoUrl();

      // Update user with new photo URL
      await this.userRepository.update(input.userId, { photoUrl });

      return {
        photoUrl,
        message: "Profile photo uploaded successfully",
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(
        `Error uploading profile photo: ${(error as Error).message}`,
        500
      );
    }
  }

  /**
   * Cleans up all existing profile photos for a user
   */
  private async cleanupUserProfilePhotos(userId: string): Promise<void> {
    try {
      // Get user to check for existing photo URL
      const user = await this.userRepository.findById(userId);

      if (user?.photoUrl) {
        const oldPhotoPath = this.extractPathFromUrl(user.photoUrl, userId);
        if (oldPhotoPath) {
          await this.fileStorageService.deleteFile(oldPhotoPath);
        }
      }

      // Also clean up any orphaned files in the user's profile directory
      const userProfileDir = `users/${userId}/profile`;
      await this.fileStorageService.cleanupDirectory(userProfileDir);
    } catch {
      // Log error but don't fail the upload process
      // Note: Using logger would be preferred, but this is a cleanup operation
      // that shouldn't fail the main upload process
    }
  }

  /**
   * Generates API URL for profile photo
   */
  private generateApiPhotoUrl(): string {
    const baseUrl = process.env["API_BASE_URL"] || "http://localhost:8000";
    const apiVersion = process.env["API_VERSION"] || "1";
    return `${baseUrl}/api/v${apiVersion}/account/profile-photo`;
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
