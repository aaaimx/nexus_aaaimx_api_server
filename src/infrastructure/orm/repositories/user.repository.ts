import { PrismaClient } from "@prisma/client";
import { User } from "@/domain/entities/user.entity";
import { UserWithRole } from "@/domain/entities/user-role.entity";
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

  private mapToUserWithRole(user: any): UserWithRole {
    const userWithRole: UserWithRole = {
      id: user.id,
      email: user.email,
      isEmailVerified: user.is_email_verified,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      allowNotifications: user.allow_notifications,
      role: user.user_roles[0]?.role
        ? {
          id: user.user_roles[0].role.id,
          name: user.user_roles[0].role.name,
          description: user.user_roles[0].role.description,
        }
        : {
          id: "",
          name: "No Role",
          description: "User has no assigned role",
        },
      divisions: user.user_divisions.map((ud: any) => {
        const division: { id: string; name: string; description?: string } = {
          id: ud.division.id,
          name: ud.division.name,
        };
        if (ud.division.description) {
          division.description = ud.division.description;
        }
        return division;
      }),
      clubs: user.user_clubs.map((uc: any) => {
        const club: { id: string; name: string; description?: string } = {
          id: uc.club.id,
          name: uc.club.name,
        };
        if (uc.club.description) {
          club.description = uc.club.description;
        }
        return club;
      }),
    };

    if (user.first_name) userWithRole.firstName = user.first_name;
    if (user.last_name) userWithRole.lastName = user.last_name;
    if (user.bio) userWithRole.bio = user.bio;
    if (user.photo_url) userWithRole.photoUrl = user.photo_url;
    if (user.last_login_at) userWithRole.lastLoginAt = user.last_login_at;

    return userWithRole;
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
        password: user.password ?? null,
        first_name: user.firstName ?? null,
        last_name: user.lastName ?? null,
        bio: user.bio ?? null,
        photo_url: user.photoUrl ?? null,
        is_email_verified: user.isEmailVerified || false,
        is_active: user.isActive !== undefined ? user.isActive : true,
        allow_notifications:
          user.allowNotifications !== undefined
            ? user.allowNotifications
            : true,
        verification_code: user.verificationCode ?? null,
        verification_expires: user.verificationExpires ?? null,
        reset_password_code: user.resetPasswordCode ?? null,
        reset_password_expires: user.resetPasswordExpires ?? null,
        google_id: user.googleId ?? null,
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
        password: user.password ?? null,
        first_name: user.firstName ?? null,
        last_name: user.lastName ?? null,
        bio: user.bio ?? null,
        photo_url: user.photoUrl ?? null,
        is_email_verified: user.isEmailVerified,
        is_active: user.isActive,
        allow_notifications: user.allowNotifications,
        verification_code: user.verificationCode ?? null,
        verification_expires: user.verificationExpires ?? null,
        reset_password_code: user.resetPasswordCode ?? null,
        reset_password_expires: user.resetPasswordExpires ?? null,
        google_id: user.googleId ?? null,
        last_login_at: user.lastLoginAt ?? null,
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

  async findUsersWithRoles(
    skip = 0,
    limit = 50
  ): Promise<{ users: UserWithRole[]; total: number }> {
    try {
      const [users, total] = await Promise.all([
        this.prisma.users.findMany({
          skip,
          take: limit,
          include: {
            user_roles: {
              include: {
                role: true,
              },
            },
            user_divisions: {
              include: {
                division: true,
              },
            },
            user_clubs: {
              include: {
                club: true,
              },
            },
          },
        }),
        this.prisma.users.count(),
      ]);

      const usersWithRoles: UserWithRole[] = users.map((user) =>
        this.mapToUserWithRole(user)
      );

      return { users: usersWithRoles, total };
    } catch (error) {
      throw new AppException(
        `Error finding users with roles: ${(error as Error).message}`,
        500
      );
    }
  }

  async findUserWithRole(userId: string): Promise<UserWithRole | null> {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        include: {
          user_roles: {
            include: {
              role: true,
            },
          },
          user_divisions: {
            include: {
              division: true,
            },
          },
          user_clubs: {
            include: {
              club: true,
            },
          },
        },
      });

      if (!user) return null;

      return this.mapToUserWithRole(user);
    } catch (error) {
      throw new AppException(
        `Error finding user with role: ${(error as Error).message}`,
        500
      );
    }
  }

  async updateUserRole(userId: string, roleId: string): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Remove existing role
        await tx.user_roles.deleteMany({
          where: { user_id: userId },
        });

        // Assign new role
        await tx.user_roles.create({
          data: {
            user_id: userId,
            role_id: roleId,
          },
        });
      });
    } catch (error) {
      throw new AppException(
        `Error updating user role: ${(error as Error).message}`,
        500
      );
    }
  }

  async getUserDivisions(userId: string): Promise<string[]> {
    try {
      const userDivisions = await this.prisma.user_divisions.findMany({
        where: { user_id: userId },
        select: { division_id: true },
      });

      return userDivisions.map((ud) => ud.division_id);
    } catch (error) {
      throw new AppException(
        `Error getting user divisions: ${(error as Error).message}`,
        500
      );
    }
  }

  async getUserClubs(userId: string): Promise<string[]> {
    try {
      const userClubs = await this.prisma.user_clubs.findMany({
        where: { user_id: userId },
        select: { club_id: true },
      });

      return userClubs.map((uc) => uc.club_id);
    } catch (error) {
      throw new AppException(
        `Error getting user clubs: ${(error as Error).message}`,
        500
      );
    }
  }

  async findUsersByDivision(divisionId: string): Promise<UserWithRole[]> {
    try {
      const users = await this.prisma.users.findMany({
        where: {
          user_divisions: {
            some: { division_id: divisionId },
          },
        },
        include: {
          user_roles: {
            include: {
              role: true,
            },
          },
          user_divisions: {
            include: {
              division: true,
            },
          },
          user_clubs: {
            include: {
              club: true,
            },
          },
        },
      });

      return users.map((user) => this.mapToUserWithRole(user));
    } catch (error) {
      throw new AppException(
        `Error finding users by division: ${(error as Error).message}`,
        500
      );
    }
  }

  async findUsersByClub(clubId: string): Promise<UserWithRole[]> {
    try {
      const users = await this.prisma.users.findMany({
        where: {
          user_clubs: {
            some: { club_id: clubId },
          },
        },
        include: {
          user_roles: {
            include: {
              role: true,
            },
          },
          user_divisions: {
            include: {
              division: true,
            },
          },
          user_clubs: {
            include: {
              club: true,
            },
          },
        },
      });

      return users.map((user) => this.mapToUserWithRole(user));
    } catch (error) {
      throw new AppException(
        `Error finding users by club: ${(error as Error).message}`,
        500
      );
    }
  }

  async findUsersByRole(roleId: string): Promise<UserWithRole[]> {
    try {
      const users = await this.prisma.users.findMany({
        where: {
          user_roles: {
            some: { role_id: roleId },
          },
        },
        include: {
          user_roles: {
            include: {
              role: true,
            },
          },
          user_divisions: {
            include: {
              division: true,
            },
          },
          user_clubs: {
            include: {
              club: true,
            },
          },
        },
      });

      return users.map((user) => this.mapToUserWithRole(user));
    } catch (error) {
      throw new AppException(
        `Error finding users by role: ${(error as Error).message}`,
        500
      );
    }
  }
}
