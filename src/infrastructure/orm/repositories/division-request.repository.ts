import { PrismaClient } from "@prisma/client";
import { DivisionRequest, RequestStatus } from "@/domain/entities/division-request.entity";
import { IDivisionRequestRepository } from "@/domain/repositories/division-request.repository";
import AppException from "@/shared/utils/exception.util";

export class DivisionRequestRepository implements IDivisionRequestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<DivisionRequest | null> {
    try {
      const request = await this.prisma.division_requests.findUnique({
        where: { id },
      });

      if (!request) {
        return null;
      }

      return new DivisionRequest(
        request.id,
        request.user_id,
        request.division_id,
        request.status as RequestStatus,
        request.message || undefined,
        request.admin_message || undefined,
        request.created_at,
        request.updated_at
      );
    } catch (error) {
      throw new AppException(
        `Error finding division request: ${(error as Error).message}`,
        500
      );
    }
  }

  async findByUserAndDivision(userId: string, divisionId: string): Promise<DivisionRequest | null> {
    try {
      const request = await this.prisma.division_requests.findUnique({
        where: {
          user_id_division_id: {
            user_id: userId,
            division_id: divisionId,
          },
        },
      });

      if (!request) {
        return null;
      }

      return new DivisionRequest(
        request.id,
        request.user_id,
        request.division_id,
        request.status as RequestStatus,
        request.message || undefined,
        request.admin_message || undefined,
        request.created_at,
        request.updated_at
      );
    } catch (error) {
      throw new AppException(
        `Error finding division request by user and division: ${(error as Error).message}`,
        500
      );
    }
  }

  async findByDivision(divisionId: string): Promise<DivisionRequest[]> {
    try {
      const requests = await this.prisma.division_requests.findMany({
        where: { division_id: divisionId },
        orderBy: { created_at: "desc" },
      });

      return requests.map(
        (request) =>
          new DivisionRequest(
            request.id,
            request.user_id,
            request.division_id,
            request.status as RequestStatus,
            request.message || undefined,
            request.admin_message || undefined,
            request.created_at,
            request.updated_at
          )
      );
    } catch (error) {
      throw new AppException(
        `Error finding division requests by division: ${(error as Error).message}`,
        500
      );
    }
  }

  async findByUser(userId: string): Promise<DivisionRequest[]> {
    try {
      const requests = await this.prisma.division_requests.findMany({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
      });

      return requests.map(
        (request) =>
          new DivisionRequest(
            request.id,
            request.user_id,
            request.division_id,
            request.status as RequestStatus,
            request.message || undefined,
            request.admin_message || undefined,
            request.created_at,
            request.updated_at
          )
      );
    } catch (error) {
      throw new AppException(
        `Error finding division requests by user: ${(error as Error).message}`,
        500
      );
    }
  }

  async create(request: DivisionRequest): Promise<DivisionRequest> {
    try {
      const createdRequest = await this.prisma.division_requests.create({
        data: {
          id: request.id,
          user_id: request.userId,
          division_id: request.divisionId,
          status: request.status,
          message: request.message || null,
          admin_message: request.adminMessage || null,
        },
      });

      return new DivisionRequest(
        createdRequest.id,
        createdRequest.user_id,
        createdRequest.division_id,
        createdRequest.status as RequestStatus,
        createdRequest.message || undefined,
        createdRequest.admin_message || undefined,
        createdRequest.created_at,
        createdRequest.updated_at
      );
    } catch (error) {
      throw new AppException(
        `Error creating division request: ${(error as Error).message}`,
        500
      );
    }
  }

  async update(id: string, request: DivisionRequest): Promise<DivisionRequest> {
    try {
      const updatedRequest = await this.prisma.division_requests.update({
        where: { id },
        data: {
          status: request.status,
          admin_message: request.adminMessage || null,
          updated_at: new Date(),
        },
      });

      return new DivisionRequest(
        updatedRequest.id,
        updatedRequest.user_id,
        updatedRequest.division_id,
        updatedRequest.status as RequestStatus,
        updatedRequest.message || undefined,
        updatedRequest.admin_message || undefined,
        updatedRequest.created_at,
        updatedRequest.updated_at
      );
    } catch (error) {
      throw new AppException(
        `Error updating division request: ${(error as Error).message}`,
        500
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.division_requests.delete({
        where: { id },
      });
    } catch (error) {
      throw new AppException(
        `Error deleting division request: ${(error as Error).message}`,
        500
      );
    }
  }

  async existsByUserAndDivision(userId: string, divisionId: string): Promise<boolean> {
    try {
      const request = await this.prisma.division_requests.findUnique({
        where: {
          user_id_division_id: {
            user_id: userId,
            division_id: divisionId,
          },
        },
      });

      return !!request;
    } catch (error) {
      throw new AppException(
        `Error checking division request existence: ${(error as Error).message}`,
        500
      );
    }
  }
}
