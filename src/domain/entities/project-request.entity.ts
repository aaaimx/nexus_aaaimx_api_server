export enum RequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface IProjectRequest {
  id: string;
  userId: string;
  projectId: string;
  status: RequestStatus;
  message?: string | undefined;
  adminMessage?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectRequest implements IProjectRequest {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly projectId: string,
    public readonly status: RequestStatus,
    public readonly message?: string,
    public readonly adminMessage?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(
    data: Omit<IProjectRequest, "id" | "createdAt" | "updatedAt">
  ): ProjectRequest {
    const now = new Date();
    return new ProjectRequest(
      crypto.randomUUID(),
      data.userId,
      data.projectId,
      data.status,
      data.message,
      data.adminMessage,
      now,
      now
    );
  }

  isPending(): boolean {
    return this.status === RequestStatus.PENDING;
  }

  isApproved(): boolean {
    return this.status === RequestStatus.APPROVED;
  }

  isRejected(): boolean {
    return this.status === RequestStatus.REJECTED;
  }

  canBeProcessed(): boolean {
    return this.status === RequestStatus.PENDING;
  }

  approve(adminMessage?: string): ProjectRequest {
    if (!this.canBeProcessed()) {
      throw new Error("Request can only be processed when in PENDING status");
    }

    const now = new Date();
    return new ProjectRequest(
      this.id,
      this.userId,
      this.projectId,
      RequestStatus.APPROVED,
      this.message,
      adminMessage,
      this.createdAt,
      now
    );
  }

  reject(adminMessage?: string): ProjectRequest {
    if (!this.canBeProcessed()) {
      throw new Error("Request can only be processed when in PENDING status");
    }

    const now = new Date();
    return new ProjectRequest(
      this.id,
      this.userId,
      this.projectId,
      RequestStatus.REJECTED,
      this.message,
      adminMessage,
      this.createdAt,
      now
    );
  }
}
