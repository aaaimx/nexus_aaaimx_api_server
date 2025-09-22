import { PrismaClient } from "@prisma/client";
import {
  IDivisionRepository,
  CreateDivisionData,
  UpdateDivisionData,
} from "@/domain/repositories";
import { Division } from "@/domain/entities";

export class DivisionRepository implements IDivisionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Division[]> {
    const divisions = await this.prisma.divisions.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return divisions.map((division) => ({
      id: division.id,
      name: division.name,
      description: division.description || undefined,
      logoUrl: division.logo_url || undefined,
      createdAt: division.created_at,
      updatedAt: division.updated_at,
    }));
  }

  async findById(id: string): Promise<Division | null> {
    const division = await this.prisma.divisions.findUnique({
      where: { id },
    });

    if (!division) {
      return null;
    }

    return {
      id: division.id,
      name: division.name,
      description: division.description || undefined,
      logoUrl: division.logo_url || undefined,
      createdAt: division.created_at,
      updatedAt: division.updated_at,
    };
  }

  async findByName(name: string): Promise<Division | null> {
    const division = await this.prisma.divisions.findUnique({
      where: { name },
    });

    if (!division) {
      return null;
    }

    return {
      id: division.id,
      name: division.name,
      description: division.description || undefined,
      logoUrl: division.logo_url || undefined,
      createdAt: division.created_at,
      updatedAt: division.updated_at,
    };
  }

  async create(data: CreateDivisionData): Promise<Division> {
    const division = await this.prisma.divisions.create({
      data: {
        name: data.name,
        description: data.description || null,
        logo_url: data.logoUrl || null,
      },
    });

    return {
      id: division.id,
      name: division.name,
      description: division.description || undefined,
      logoUrl: division.logo_url || undefined,
      createdAt: division.created_at,
      updatedAt: division.updated_at,
    };
  }

  async update(id: string, data: UpdateDivisionData): Promise<Division> {
    const division = await this.prisma.divisions.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description || null,
        }),
        ...(data.logoUrl !== undefined && { logo_url: data.logoUrl || null }),
      },
    });

    return {
      id: division.id,
      name: division.name,
      description: division.description || undefined,
      logoUrl: division.logo_url || undefined,
      createdAt: division.created_at,
      updatedAt: division.updated_at,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.divisions.delete({
      where: { id },
    });
  }
}
