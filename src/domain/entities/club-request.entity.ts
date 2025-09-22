export enum RequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface IClubRequest {
  id: string;
  userId: string;
  clubId: string;
  status: RequestStatus;
  message?: string | undefined;
  adminMessage?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export class ClubRequest implements IClubRequest {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly clubId: string,
    public readonly status: RequestStatus,
    public readonly message: string | undefined,
    public readonly adminMessage: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    id: string,
    userId: string,
    clubId: string,
    message?: string
  ): ClubRequest {
    return new ClubRequest(
      id,
      userId,
      clubId,
      RequestStatus.PENDING,
      message,
      undefined,
      new Date(),
      new Date()
    );
  }

  approve(adminMessage?: string): ClubRequest {
    return new ClubRequest(
      this.id,
      this.userId,
      this.clubId,
      RequestStatus.APPROVED,
      this.message,
      adminMessage,
      this.createdAt,
      new Date()
    );
  }

  reject(adminMessage?: string): ClubRequest {
    return new ClubRequest(
      this.id,
      this.userId,
      this.clubId,
      RequestStatus.REJECTED,
      this.message,
      adminMessage,
      this.createdAt,
      new Date()
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
}
