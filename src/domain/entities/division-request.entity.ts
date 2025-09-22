export enum RequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface IDivisionRequest {
  id: string;
  userId: string;
  divisionId: string;
  status: RequestStatus;
  message?: string | undefined;
  adminMessage?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export class DivisionRequest implements IDivisionRequest {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly divisionId: string,
    public readonly status: RequestStatus,
    public readonly message: string | undefined,
    public readonly adminMessage: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    id: string,
    userId: string,
    divisionId: string,
    message?: string
  ): DivisionRequest {
    return new DivisionRequest(
      id,
      userId,
      divisionId,
      RequestStatus.PENDING,
      message,
      undefined,
      new Date(),
      new Date()
    );
  }

  approve(adminMessage?: string): DivisionRequest {
    return new DivisionRequest(
      this.id,
      this.userId,
      this.divisionId,
      RequestStatus.APPROVED,
      this.message,
      adminMessage,
      this.createdAt,
      new Date()
    );
  }

  reject(adminMessage?: string): DivisionRequest {
    return new DivisionRequest(
      this.id,
      this.userId,
      this.divisionId,
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
