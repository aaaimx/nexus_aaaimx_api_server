import fs from "fs";
import path from "path";
import { promisify } from "util";
import AppException from "@/shared/utils/exception.util";
import { FileValidationUtil } from "@/shared/utils/file-validation.util";

const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const access = promisify(fs.access);

export class FileStorageService {
  private readonly uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), "uploads");
    this.ensureUploadsDirectory();
  }

  /**
   * Ensures the uploads directory exists
   */
  private async ensureUploadsDirectory(): Promise<void> {
    try {
      await access(this.uploadsDir);
    } catch {
      await mkdir(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Saves a file to the specified path
   */
  async saveFile(
    file: Express.Multer.File,
    relativePath: string
  ): Promise<string> {
    try {
      const fullPath = path.join(this.uploadsDir, relativePath);
      const dir = path.dirname(fullPath);

      // Ensure directory exists
      await mkdir(dir, { recursive: true });

      // Write file
      await fs.promises.writeFile(fullPath, file.buffer);

      return relativePath;
    } catch (error) {
      throw new AppException(
        `Error saving file: ${(error as Error).message}`,
        500
      );
    }
  }

  /**
   * Saves user profile photo
   */
  async saveUserProfilePhoto(
    file: Express.Multer.File,
    userId: string
  ): Promise<string> {
    // Validate file
    FileValidationUtil.validateImage(file);

    // Generate unique filename
    const filename = FileValidationUtil.generateUniqueFilename(
      file.originalname
    );

    // Create relative path
    const relativePath = FileValidationUtil.getUserProfilePhotoPath(
      userId,
      filename
    );

    // Save file
    return await this.saveFile(file, relativePath);
  }

  /**
   * Deletes a file
   */
  async deleteFile(relativePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadsDir, relativePath);
      await unlink(fullPath);
    } catch (error) {
      // Don't throw error if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw new AppException(
          `Error deleting file: ${(error as Error).message}`,
          500
        );
      }
    }
  }

  /**
   * Gets the full URL for a file
   */
  getFileUrl(relativePath: string): string {
    const baseUrl = process.env["API_BASE_URL"] || "http://localhost:8000";
    return `${baseUrl}/uploads/${relativePath}`;
  }

  /**
   * Gets the full file path
   */
  getFilePath(relativePath: string): string {
    return path.join(this.uploadsDir, relativePath);
  }

  /**
   * Checks if a file exists
   */
  async fileExists(relativePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadsDir, relativePath);
      await access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Cleans up all files in a directory
   */
  async cleanupDirectory(relativePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadsDir, relativePath);

      // Check if directory exists
      try {
        await access(fullPath);
      } catch {
        // Directory doesn't exist, nothing to clean up
        return;
      }

      // Read directory contents
      const files = await fs.promises.readdir(fullPath);

      // Delete all files in the directory
      for (const file of files) {
        const filePath = path.join(fullPath, file);
        try {
          const stat = await fs.promises.stat(filePath);
          if (stat.isFile()) {
            await unlink(filePath);
          }
        } catch {
          // Log error but continue with other files
          // Note: Using logger would be preferred, but this is a cleanup operation
        }
      }
    } catch {
      // Log error but don't throw
      // Note: Using logger would be preferred, but this is a cleanup operation
    }
  }
}
