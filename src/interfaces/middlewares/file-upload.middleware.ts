import multer from "multer";
import { Request, Response, NextFunction } from "express";
import AppException from "@/shared/utils/exception.util";
import {
  FileValidationUtil,
  DEFAULT_IMAGE_CONFIG,
} from "@/shared/utils/file-validation.util";

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: DEFAULT_IMAGE_CONFIG.maxSizeInMB * 1024 * 1024, // Convert MB to bytes
  },
  fileFilter: (_req, file, cb) => {
    // Check MIME type
    if (DEFAULT_IMAGE_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppException(
          `Invalid file type. Allowed types: ${DEFAULT_IMAGE_CONFIG.allowedMimeTypes.join(
            ", "
          )}`,
          400
        )
      );
    }
  },
});

/**
 * Middleware for handling profile photo uploads
 */
export const profilePhotoUpload = upload.single("profile_photo") as any;

/**
 * Middleware for handling multiple file uploads (if needed in the future)
 */
export const multipleFileUpload = upload.array("files", 5) as any;

/**
 * Middleware to validate uploaded files
 */
export const validateUploadedFile = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.file) {
      return next(); // No file uploaded, continue
    }

    // Validate the uploaded file
    FileValidationUtil.validateImage(req.file);

    next();
  } catch (error) {
    if (error instanceof AppException) {
      res.status(error.status).json({
        success: false,
        message: error.message,
        data: null,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "File validation error",
        data: null,
      });
    }
  }
};

/**
 * Middleware to handle multer errors
 */
export const handleMulterError = (
  error: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof multer.MulterError) {
    let message = "File upload error";

    switch (error.code) {
    case "LIMIT_FILE_SIZE":
      message = `File size exceeds maximum allowed size of ${DEFAULT_IMAGE_CONFIG.maxSizeInMB}MB`;
      break;
    case "LIMIT_FILE_COUNT":
      message = "Too many files uploaded";
      break;
    case "LIMIT_UNEXPECTED_FILE":
      message = "Unexpected file field";
      break;
    default:
      message = error.message;
    }

    res.status(400).json({
      success: false,
      message,
      data: null,
    });
  } else if (error instanceof AppException) {
    res.status(error.status).json({
      success: false,
      message: error.message,
      data: null,
    });
  } else {
    next(error);
  }
};
