import { PrismaClient } from "@prisma/client";
import { IDivisionRepository } from "@/domain/repositories";
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
}
