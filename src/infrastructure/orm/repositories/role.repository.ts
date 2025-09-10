import { PrismaClient } from "@prisma/client";
import { Role } from "@/domain/entities/role.entity";
import { IRoleRepository } from "@/domain/repositories/role.repository";
import AppException from "@/shared/utils/exception.util";

export class RoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Role | null> {
    try {
      const role = await this.prisma.roles.findUnique({
        where: { id },
      });

      if (!role) return null;

      return this.mapToEntity(role);
    } catch (error) {
      throw new AppException(
        `Error finding role by ID: ${(error as Error).message}`,
        500
      );
    }
  }

  async findByName(name: string): Promise<Role | null> {
    try {
      const role = await this.prisma.roles.findUnique({
        where: { name },
      });

      if (!role) return null;

      return this.mapToEntity(role);
    } catch (error) {
      throw new AppException(
        `Error finding role by name: ${(error as Error).message}`,
        500
      );
    }
  }

  async findDefault(): Promise<Role> {
    try {
      const role = await this.prisma.roles.findUnique({
        where: { name: "member" },
      });

      if (!role) {
        throw new AppException("Default role 'member' not found", 404);
      }

      return this.mapToEntity(role);
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(
        `Error finding default role: ${(error as Error).message}`,
        500
      );
    }
  }

  async findAll(): Promise<Role[]> {
    try {
      const roles = await this.prisma.roles.findMany();
      return roles.map((role) => this.mapToEntity(role));
    } catch (error) {
      throw new AppException(
        `Error finding all roles: ${(error as Error).message}`,
        500
      );
    }
  }

  async create(role: Partial<Role>): Promise<Role> {
    try {
      const createdRole = await this.prisma.roles.create({
        data: {
          name: role.name!,
          description: role.description!,
        },
      });

      return this.mapToEntity(createdRole);
    } catch (error) {
      throw new AppException(
        `Error creating role: ${(error as Error).message}`,
        500
      );
    }
  }

  async update(id: string, role: Partial<Role>): Promise<Role> {
    try {
      const updatedRole = await this.prisma.roles.update({
        where: { id },
        data: {
          ...(role.name !== undefined && { name: role.name }),
          ...(role.description !== undefined && {
            description: role.description,
          }),
        },
      });

      return this.mapToEntity(updatedRole);
    } catch (error) {
      throw new AppException(
        `Error updating role: ${(error as Error).message}`,
        500
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.roles.delete({
        where: { id },
      });
    } catch (error) {
      throw new AppException(
        `Error deleting role: ${(error as Error).message}`,
        500
      );
    }
  }

  private mapToEntity(role: any): Role {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.created_at,
      updatedAt: role.updated_at,
    };
  }
}
