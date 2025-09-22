import { PrismaClient } from "@prisma/client";
import {
  IClubRepository,
  CreateClubData,
  UpdateClubData,
} from "@/domain/repositories";
import { Club } from "@/domain/entities";

export class ClubRepository implements IClubRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Club[]> {
    const clubs = await this.prisma.clubs.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return clubs.map((club) => ({
      id: club.id,
      name: club.name,
      description: club.description || undefined,
      logoUrl: club.logo_url || undefined,
      createdAt: club.created_at,
      updatedAt: club.updated_at,
    }));
  }

  async findById(id: string): Promise<Club | null> {
    const club = await this.prisma.clubs.findUnique({
      where: { id },
    });

    if (!club) {
      return null;
    }

    return {
      id: club.id,
      name: club.name,
      description: club.description || undefined,
      logoUrl: club.logo_url || undefined,
      createdAt: club.created_at,
      updatedAt: club.updated_at,
    };
  }

  async findByName(name: string): Promise<Club | null> {
    const club = await this.prisma.clubs.findUnique({
      where: { name },
    });

    if (!club) {
      return null;
    }

    return {
      id: club.id,
      name: club.name,
      description: club.description || undefined,
      logoUrl: club.logo_url || undefined,
      createdAt: club.created_at,
      updatedAt: club.updated_at,
    };
  }

  async create(data: CreateClubData): Promise<Club> {
    const club = await this.prisma.clubs.create({
      data: {
        name: data.name,
        description: data.description || null,
        logo_url: data.logoUrl || null,
      },
    });

    return {
      id: club.id,
      name: club.name,
      description: club.description || undefined,
      logoUrl: club.logo_url || undefined,
      createdAt: club.created_at,
      updatedAt: club.updated_at,
    };
  }

  async update(id: string, data: UpdateClubData): Promise<Club> {
    const club = await this.prisma.clubs.update({
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
      id: club.id,
      name: club.name,
      description: club.description || undefined,
      logoUrl: club.logo_url || undefined,
      createdAt: club.created_at,
      updatedAt: club.updated_at,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.clubs.delete({
      where: { id },
    });
  }
}
