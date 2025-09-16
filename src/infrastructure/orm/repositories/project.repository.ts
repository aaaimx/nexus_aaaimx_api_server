import { PrismaClient } from "@prisma/client";
import {
  IProjectRepository,
  ProjectFilters,
} from "@/domain/repositories/project.repository";
import { Project, ContentStatus } from "@/domain/entities/project.entity";

export class ProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(project: Project): Promise<Project> {
    // Validate that the user exists first
    const userExists = await this.prisma.users.findUnique({
      where: { id: project.userId },
    });
    if (!userExists) {
      throw new Error(`User with ID ${project.userId} not found`);
    }

    // Create the project directly with relations (no separate update needed)
    const createData: any = {
      name: project.name,
      description: project.description,
      cover_url: project.coverUrl,
      status: project.status as any,
      is_public: project.isPublic,
      user_id: project.userId,
    };

    // Validate and add tags if provided
    if (project.tags && project.tags.length > 0) {
      const validTagIds = project.tags.filter((id) => id && id.trim() !== "");
      if (validTagIds.length > 0) {
        // Verify that all tags exist
        const existingTags = await this.prisma.tags.findMany({
          where: { id: { in: validTagIds } },
        });
        const existingTagIds = existingTags.map((tag) => tag.id);

        if (existingTagIds.length > 0) {
          createData.tags = {
            connect: existingTagIds.map((tagId) => ({ id: tagId })),
          };
        }
      }
    }

    // Validate and add clubs if provided
    if (project.clubIds && project.clubIds.length > 0) {
      const validClubIds = project.clubIds.filter(
        (id) => id && id.trim() !== ""
      );
      if (validClubIds.length > 0) {
        // Verify that all clubs exist
        const existingClubs = await this.prisma.clubs.findMany({
          where: { id: { in: validClubIds } },
        });
        const existingClubIds = existingClubs.map((club) => club.id);

        if (existingClubIds.length > 0) {
          createData.clubs = {
            connect: existingClubIds.map((clubId) => ({ id: clubId })),
          };
        }
      }
    }

    // Validate and add divisions if provided
    if (project.divisionIds && project.divisionIds.length > 0) {
      const validDivisionIds = project.divisionIds.filter(
        (id) => id && id.trim() !== ""
      );
      if (validDivisionIds.length > 0) {
        // Verify that all divisions exist
        const existingDivisions = await this.prisma.divisions.findMany({
          where: { id: { in: validDivisionIds } },
        });
        const existingDivisionIds = existingDivisions.map(
          (division) => division.id
        );

        if (existingDivisionIds.length > 0) {
          createData.divisions = {
            connect: existingDivisionIds.map((divisionId) => ({
              id: divisionId,
            })),
          };
        }
      }
    }

    const created = await this.prisma.projects.create({
      data: createData,
      include: {
        tags: true,
        clubs: true,
        divisions: true,
        user_projects: {
          include: {
            user: true,
          },
        },
      },
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<Project | null> {
    const project = await this.prisma.projects.findUnique({
      where: { id },
      include: {
        tags: true,
        clubs: true,
        divisions: true,
        user_projects: {
          include: {
            user: true,
          },
        },
      },
    });

    return project ? this.mapToEntity(project) : null;
  }

  async findByName(name: string): Promise<Project | null> {
    const project = await this.prisma.projects.findUnique({
      where: { name },
      include: {
        tags: true,
        clubs: true,
        divisions: true,
        user_projects: {
          include: {
            user: true,
          },
        },
      },
    });

    return project ? this.mapToEntity(project) : null;
  }

  async findAll(filters: ProjectFilters = {}): Promise<Project[]> {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.isPublic !== undefined) {
      where.is_public = filters.isPublic;
    }

    if (filters.userId) {
      where.user_id = filters.userId;
    }

    if (filters.clubId) {
      where.clubs = {
        some: { id: filters.clubId },
      };
    }

    if (filters.divisionId) {
      where.divisions = {
        some: { id: filters.divisionId },
      };
    }

    if (filters.tagId) {
      where.tags = {
        some: { id: filters.tagId },
      };
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const projects = await this.prisma.projects.findMany({
      where,
      include: {
        tags: true,
        clubs: true,
        divisions: true,
        user_projects: {
          include: {
            user: true,
          },
        },
      },
      ...(filters.limit && { take: filters.limit }),
      ...(filters.offset && { skip: filters.offset }),
      orderBy: { created_at: "desc" },
    });

    return projects.map((project) => this.mapToEntity(project));
  }

  async update(id: string, data: Partial<Project>): Promise<Project | null> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.coverUrl !== undefined) updateData.cover_url = data.coverUrl;
    if (data.status !== undefined) updateData.status = data.status as any;
    if (data.isPublic !== undefined) updateData.is_public = data.isPublic;

    const updated = await this.prisma.projects.update({
      where: { id },
      data: updateData,
      include: {
        tags: true,
        clubs: true,
        divisions: true,
        user_projects: {
          include: {
            user: true,
          },
        },
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.projects.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async findUserProjects(userId: string): Promise<Project[]> {
    const projects = await this.prisma.projects.findMany({
      where: { user_id: userId },
      include: {
        tags: true,
        clubs: true,
        divisions: true,
        user_projects: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return projects.map((project) => this.mapToEntity(project));
  }

  async findProjectsByClub(clubId: string): Promise<Project[]> {
    const projects = await this.prisma.projects.findMany({
      where: {
        clubs: {
          some: { id: clubId },
        },
      },
      include: {
        tags: true,
        clubs: true,
        divisions: true,
        user_projects: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return projects.map((project) => this.mapToEntity(project));
  }

  async findProjectsByDivision(divisionId: string): Promise<Project[]> {
    const projects = await this.prisma.projects.findMany({
      where: {
        divisions: {
          some: { id: divisionId },
        },
      },
      include: {
        tags: true,
        clubs: true,
        divisions: true,
        user_projects: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return projects.map((project) => this.mapToEntity(project));
  }

  async addMember(projectId: string, userId: string): Promise<boolean> {
    try {
      await this.prisma.user_projects.create({
        data: {
          user_id: userId,
          project_id: projectId,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async removeMember(projectId: string, userId: string): Promise<boolean> {
    try {
      await this.prisma.user_projects.delete({
        where: {
          user_id_project_id: {
            user_id: userId,
            project_id: projectId,
          },
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async isMember(projectId: string, userId: string): Promise<boolean> {
    const membership = await this.prisma.user_projects.findUnique({
      where: {
        user_id_project_id: {
          user_id: userId,
          project_id: projectId,
        },
      },
    });

    return !!membership;
  }

  async getMembers(projectId: string): Promise<string[]> {
    const memberships = await this.prisma.user_projects.findMany({
      where: { project_id: projectId },
      select: { user_id: true },
    });

    return memberships.map((membership) => membership.user_id);
  }

  private mapToEntity(project: any): Project {
    return new Project(
      project.id,
      project.name,
      project.description,
      project.cover_url,
      project.status as ContentStatus,
      project.is_public,
      project.created_at,
      project.updated_at,
      project.user_id,
      project.tags?.map((tag: any) => tag.id) || [],
      project.clubs?.map((club: any) => club.id) || [],
      project.divisions?.map((division: any) => division.id) || [],
      project.user_projects?.map((up: any) => up.user_id) || []
    );
  }
}
