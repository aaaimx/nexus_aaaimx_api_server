import { env } from "@/infrastructure/config/env.config";
import AppException from "@/shared/utils/exception.util";

export interface VerificationCode {
  code: string;
  expiresAt: Date;
}

export default class VerificationCodeService {
  generateCode(
    length: number = 6,
    expirationMinutes: number = 15
  ): VerificationCode {
    if (!env.secretCode) {
      throw new AppException("Verification code secret is not configured", 500);
    }

    const secretCode = env.secretCode as string;

    // Generate random code
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    let code = "";
    for (let i = 0; i < length; i++) {
      const randomValue = randomValues[i]!;
      const randomIndex = randomValue % secretCode!.length;
      code += secretCode!.charAt(randomIndex);
    }

    // Set expiration
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

    return {
      code,
      expiresAt,
    };
  }

  isExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  validateCode(
    inputCode: string,
    storedCode: string | null | undefined,
    expiresAt: Date | null | undefined
  ): boolean {
    if (!storedCode || !expiresAt) {
      throw new AppException("No verification code found", 400);
    }

    if (this.isExpired(expiresAt)) {
      throw new AppException("Verification code has expired", 400);
    }

    return inputCode.toUpperCase() === storedCode.toUpperCase();
  }
}
