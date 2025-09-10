import { User } from "@/domain/entities/user.entity";
import { Role } from "@/domain/entities/role.entity";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { IRoleRepository } from "@/domain/repositories/role.repository";
import { JwtService } from "@/infrastructure/external-services";
import { PasswordService } from "@/infrastructure/external-services";
import { VerificationCodeService } from "@/infrastructure/external-services";
import { MailService } from "@/infrastructure/external-services";
import { SessionService } from "@/application/services/auth/session.service";
import { GoogleUserInfo } from "@/infrastructure/external-services/google-oauth.service";

export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-123",
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
    isEmailVerified: true,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    allowNotifications: true,
    ...overrides,
  };
}

export function createMockRole(overrides: Partial<Role> = {}): Role {
  return {
    id: "role-123",
    name: "member",
    description: "Default member role",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

export function createMockGoogleUser(
  overrides: Partial<GoogleUserInfo> = {}
): GoogleUserInfo {
  return {
    id: "google-123",
    email: "john.doe@gmail.com",
    verified_email: true,
    name: "John Doe",
    given_name: "John",
    family_name: "Doe",
    picture: "https://example.com/picture.jpg",
    ...overrides,
  };
}

export function createMockUserRepository(): jest.Mocked<IUserRepository> {
  return {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByGoogleId: jest.fn(),
    assignRole: jest.fn(),
    clearVerificationFields: jest.fn(),
    clearResetPasswordFields: jest.fn(),
    findAll: jest.fn(),
    findByVerificationCode: jest.fn(),
    findByResetPasswordCode: jest.fn(),
    getUserRoleId: jest.fn(),
  };
}

export function createMockRoleRepository(): jest.Mocked<IRoleRepository> {
  return {
    findById: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findDefault: jest.fn(),
    findAll: jest.fn(),
  };
}

export function createMockJwtService(): jest.Mocked<JwtService> {
  return {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    getUserIdFromToken: jest.fn(),
    extractAndValidateToken: jest.fn(),
    extractTokenFromRequest: jest.fn(),
  };
}

export function createMockPasswordService(): jest.Mocked<PasswordService> {
  return {
    hash: jest.fn(),
    compare: jest.fn(),
  };
}

export function createMockVerificationCodeService(): jest.Mocked<VerificationCodeService> {
  return {
    generateCode: jest.fn(),
    validateCode: jest.fn(),
    isExpired: jest.fn(),
  };
}

export function createMockMailService(): jest.Mocked<MailService> {
  const mockService = {
    sendVerificationEmail: jest.fn(),
    sendEmailVerifiedConfirmation: jest.fn(),
    sendVerificationSuccessEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    sendPasswordResetSuccessEmail: jest.fn(),
    sendGenericEmail: jest.fn(),
    sendEmail: jest.fn(),
    checkNotificationSettings: jest.fn(),
    sendEmailWithNotificationCheck: jest.fn(),
  } as any;

  // Add the private transporter property
  Object.defineProperty(mockService, "transporter", {
    value: {} as any,
    writable: true,
  });

  return mockService;
}

export function createMockSessionService(): jest.Mocked<SessionService> {
  const mockService = {
    updateLastSessionDate: jest.fn(),
  } as any;

  // Add the private userRepository property
  Object.defineProperty(mockService, "userRepository", {
    value: createMockUserRepository(),
    writable: true,
  });

  return mockService;
}
