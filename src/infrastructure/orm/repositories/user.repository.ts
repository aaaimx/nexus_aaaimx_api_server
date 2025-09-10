import { PrismaClient } from "@prisma/client";
import { User } from "@/domain/entities/user.entity";
import { IUserRepository } from "@/domain/repositories/user.repository";
import AppException from "@/shared/utils/exception.util";

export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private filterUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
    const filtered: Partial<T> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        filtered[key as keyof T] = value;
      }
    }
    return filtered;
  }

  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id },
      });

      if (!user) return null;

      return this.mapToEntity(user);
    } catch (error) {
      throw new AppException(
        `Error finding user by ID: ${(error as Error).message}`,
        500
      );
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.prisma.users.findUnique({
        where: { email },
      });

      if (!user) return null;

      return this.mapToEntity(user);
    } catch (error) {
      throw new AppException(
        `Error finding user by email: ${(error as Error).message}`,
        500
      );
    }
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    try {
      const user = await this.prisma.users.findUnique({
        where: { google_id: googleId },
      });

      if (!user) return null;

      return this.mapToEntity(user);
    } catch (error) {
      throw new AppException(
        `Error finding user by Google ID: ${(error as Error).message}`,
        500
      );
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.prisma.users.findMany();
      return users.map((user) => this.mapToEntity(user));
    } catch (error) {
      throw new AppException(
        `Error finding all users: ${(error as Error).message}`,
        500
      );
    }
  }

  async create(user: Partial<User>): Promise<User> {
    try {
      const filteredData = this.filterUndefined({
        password: user.password,
        first_name: user.firstName,
        last_name: user.lastName,
        bio: user.bio,
        photo_url: user.photoUrl,
        is_email_verified: user.isEmailVerified || false,
        is_active: user.isActive !== undefined ? user.isActive : true,
        allow_notifications:
          user.allowNotifications !== undefined
            ? user.allowNotifications
            : true,
        verification_code: user.verificationCode,
        verification_expires: user.verificationExpires,
        reset_password_code: user.resetPasswordCode,
        reset_password_expires: user.resetPasswordExpires,
        google_id: user.googleId,
      });

      const createdUser = await this.prisma.users.create({
        data: {
          email: user.email!,
          ...filteredData,
        },
      });

      return this.mapToEntity(createdUser);
    } catch (error) {
      throw new AppException(
        `Error creating user: ${(error as Error).message}`,
        500
      );
    }
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    try {
      const userData = this.filterUndefined({
        email: user.email,
        password: user.password,
        first_name: user.firstName,
        last_name: user.lastName,
        bio: user.bio,
        photo_url: user.photoUrl,
        is_email_verified: user.isEmailVerified,
        is_active: user.isActive,
        allow_notifications: user.allowNotifications,
        verification_code: user.verificationCode,
        verification_expires: user.verificationExpires,
        reset_password_code: user.resetPasswordCode,
        reset_password_expires: user.resetPasswordExpires,
        google_id: user.googleId,
        last_login_at: user.lastLoginAt,
      });

      const updatedUser = await this.prisma.users.update({
        where: { id },
        data: userData,
      });

      return this.mapToEntity(updatedUser);
    } catch (error) {
      throw new AppException(
        `Error updating user: ${(error as Error).message}`,
        500
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.users.delete({
        where: { id },
      });
    } catch (error) {
      throw new AppException(
        `Error deleting user: ${(error as Error).message}`,
        500
      );
    }
  }

  async findByVerificationCode(code: string): Promise<User | null> {
    try {
      const user = await this.prisma.users.findFirst({
        where: { verification_code: code },
      });

      if (!user) return null;

      return this.mapToEntity(user);
    } catch (error) {
      throw new AppException(
        `Error finding user by verification code: ${(error as Error).message}`,
        500
      );
    }
  }

  async findByResetPasswordCode(code: string): Promise<User | null> {
    try {
      const user = await this.prisma.users.findFirst({
        where: { reset_password_code: code },
      });

      if (!user) return null;

      return this.mapToEntity(user);
    } catch (error) {
      throw new AppException(
        `Error finding user by reset password code: ${
          (error as Error).message
        }`,
        500
      );
    }
  }

  private mapToEntity(user: any): User {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: user.bio,
      photoUrl: user.photo_url,
      isEmailVerified: user.is_email_verified,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLoginAt: user.last_login_at,
      allowNotifications: user.allow_notifications,
      verificationCode: user.verification_code,
      verificationExpires: user.verification_expires,
      resetPasswordCode: user.reset_password_code,
      resetPasswordExpires: user.reset_password_expires,
      googleId: user.google_id,
    };
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    try {
      await this.prisma.user_roles.create({
        data: {
          user_id: userId,
          role_id: roleId,
        },
      });
    } catch (error) {
      throw new AppException(
        `Error assigning role to user: ${(error as Error).message}`,
        500
      );
    }
  }

  async clearResetPasswordFields(id: string): Promise<void> {
    try {
      await this.prisma.users.update({
        where: { id },
        data: {
          reset_password_code: null,
          reset_password_expires: null,
        },
      });
    } catch (error) {
      throw new AppException(
        `Error clearing reset password fields: ${(error as Error).message}`,
        500
      );
    }
  }

  async clearVerificationFields(id: string): Promise<void> {
    try {
      await this.prisma.users.update({
        where: { id },
        data: {
          verification_code: null,
          verification_expires: null,
        },
      });
    } catch (error) {
      throw new AppException(
        `Error clearing verification fields: ${(error as Error).message}`,
        500
      );
    }
  }

  async getUserRoleId(userId: string): Promise<string | null> {
    try {
      const userRole = await this.prisma.user_roles.findFirst({
        where: { user_id: userId },
        select: { role_id: true },
      });

      return userRole?.role_id || null;
    } catch (error) {
      throw new AppException(
        `Error getting user role: ${(error as Error).message}`,
        500
      );
    }
  }
}
