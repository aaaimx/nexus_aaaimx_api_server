import AppException from "./exception.util";

export interface FileValidationConfig {
  maxSizeInMB: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

export const DEFAULT_IMAGE_CONFIG: FileValidationConfig = {
  maxSizeInMB: 5,
  allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
};

export class FileValidationUtil {
  /**
   * Validates file size, MIME type, and extension
   */
  static validateImage(
    file: Express.Multer.File,
    config: FileValidationConfig = DEFAULT_IMAGE_CONFIG
  ): void {
    this.validateFileSize(file, config.maxSizeInMB);
    this.validateMimeType(file, config.allowedMimeTypes);
    this.validateExtension(file, config.allowedExtensions);
  }

  /**
   * Validates file size
   */
  private static validateFileSize(
    file: Express.Multer.File,
    maxSizeInMB: number
  ): void {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
      throw new AppException(
        `File size exceeds maximum allowed size of ${maxSizeInMB}MB`,
        400
      );
    }
  }

  /**
   * Validates MIME type
   */
  private static validateMimeType(
    file: Express.Multer.File,
    allowedMimeTypes: string[]
  ): void {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new AppException(
        `Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`,
        400
      );
    }
  }

  /**
   * Validates file extension
   */
  private static validateExtension(
    file: Express.Multer.File,
    allowedExtensions: string[]
  ): void {
    const fileExtension = this.getFileExtension(file.originalname);

    if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
      throw new AppException(
        `Invalid file extension. Allowed extensions: ${allowedExtensions.join(
          ", "
        )}`,
        400
      );
    }
  }

  /**
   * Extracts file extension from filename
   */
  private static getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf(".");
    return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : "";
  }

  /**
   * Generates a unique filename with timestamp and random string
   */
  static generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = this.getFileExtension(originalName);

    // Generate a clean filename without using the original name
    return `photo_${timestamp}_${randomString}${extension}`;
  }

  /**
   * Gets the file path for user profile photos
   */
  static getUserProfilePhotoPath(userId: string, filename: string): string {
    return `users/${userId}/profile/${filename}`;
  }
}
