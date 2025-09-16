export enum ContentStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
  ONLINE = "ONLINE",
}

export interface IProject {
  id: string;
  name: string;
  description?: string | undefined;
  coverUrl?: string | undefined;
  status: ContentStatus;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  tags?: string[];
  clubIds?: string[];
  divisionIds?: string[];
  memberIds?: string[];
}

export class Project implements IProject {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description?: string,
    public readonly coverUrl?: string,
    public readonly status: ContentStatus = ContentStatus.DRAFT,
    public readonly isPublic: boolean = false,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly userId: string = "",
    public readonly tags: string[] = [],
    public readonly clubIds: string[] = [],
    public readonly divisionIds: string[] = [],
    public readonly memberIds: string[] = []
  ) {}

  static create(
    data: Omit<IProject, "id" | "createdAt" | "updatedAt">
  ): Project {
    const now = new Date();
    return new Project(
      crypto.randomUUID(),
      data.name,
      data.description,
      data.coverUrl,
      data.status,
      data.isPublic,
      now,
      now,
      data.userId,
      data.tags || [],
      data.clubIds || [],
      data.divisionIds || [],
      data.memberIds || []
    );
  }

  isDraft(): boolean {
    return this.status === ContentStatus.DRAFT;
  }

  isPublished(): boolean {
    return this.status === ContentStatus.PUBLISHED;
  }

  isArchived(): boolean {
    return this.status === ContentStatus.ARCHIVED;
  }

  isOnline(): boolean {
    return this.status === ContentStatus.ONLINE;
  }

  canBeViewedBy(userId: string, userRoles: string[]): boolean {
    // Proyectos públicos son visibles para todos
    if (this.isPublic) {
      return true;
    }

    // El creador siempre puede ver su proyecto
    if (this.userId === userId) {
      return true;
    }

    // Administradores pueden ver todos los proyectos
    if (userRoles.includes("committee") || userRoles.includes("president")) {
      return true;
    }

    // Proyectos privados solo para miembros del proyecto
    return this.memberIds.includes(userId);
  }

  canBeEditedBy(userId: string, userRoles: string[]): boolean {
    // El creador siempre puede editar su proyecto
    if (this.userId === userId) {
      return true;
    }

    // Administradores pueden editar todos los proyectos
    if (userRoles.includes("committee") || userRoles.includes("president")) {
      return true;
    }

    // Leaders y co-leaders pueden editar proyectos de su división/club
    if (userRoles.includes("leader") || userRoles.includes("co-leader")) {
      // Esta validación se hará a nivel de aplicación con la información de membresía del usuario
      return true;
    }

    return false;
  }

  canBeDeletedBy(userId: string, userRoles: string[]): boolean {
    return this.canBeEditedBy(userId, userRoles);
  }

  canManageMembersBy(userId: string, userRoles: string[]): boolean {
    return this.canBeEditedBy(userId, userRoles);
  }

  canManageRequestsBy(userId: string, userRoles: string[]): boolean {
    return this.canBeEditedBy(userId, userRoles);
  }
}
