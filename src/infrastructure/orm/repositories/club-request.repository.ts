import { PrismaClient } from "@prisma/client";
import { ClubRequest, RequestStatus } from "@/domain/entities/club-request.entity";
import { IClubRequestRepository } from "@/domain/repositories/club-request.repository";
import AppException from "@/shared/utils/exception.util";

export class ClubRequestRepository implements IClubRequestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<ClubRequest | null> {
    try {
      const request = await this.prisma.club_requests.findUnique({
        where: { id },
      });

      if (!request) {
        return null;
      }

      return new ClubRequest(
        request.id,
        request.user_id,
        request.club_id,
        request.status as RequestStatus,
        request.message || undefined,
        request.admin_message || undefined,
        request.created_at,
        request.updated_at
      );
    } catch (error) {
      throw new AppException(
        `Error finding club request: ${(error as Error).message}`,
        500
      );
    }
  }

  async findByUserAndClub(userId: string, clubId: string): Promise<ClubRequest | null> {
    try {
      const request = await this.prisma.club_requests.findUnique({
        where: {
          user_id_club_id: {
            user_id: userId,
            club_id: clubId,
          },
        },
      });

      if (!request) {
        return null;
      }

      return new ClubRequest(
        request.id,
        request.user_id,
        request.club_id,
        request.status as RequestStatus,
        request.message || undefined,
        request.admin_message || undefined,
        request.created_at,
        request.updated_at
      );
    } catch (error) {
      throw new AppException(
        `Error finding club request by user and club: ${(error as Error).message}`,
        500
      );
    }
  }

  async findByClub(clubId: string): Promise<ClubRequest[]> {
    try {
      const requests = await this.prisma.club_requests.findMany({
        where: { club_id: clubId },
        orderBy: { created_at: "desc" },
      });

      return requests.map(
        (request) =>
          new ClubRequest(
            request.id,
            request.user_id,
            request.club_id,
            request.status as RequestStatus,
            request.message || undefined,
            request.admin_message || undefined,
            request.created_at,
            request.updated_at
          )
      );
    } catch (error) {
      throw new AppException(
        `Error finding club requests by club: ${(error as Error).message}`,
        500
      );
    }
  }

  async findByUser(userId: string): Promise<ClubRequest[]> {
    try {
      const requests = await this.prisma.club_requests.findMany({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
      });

      return requests.map(
        (request) =>
          new ClubRequest(
            request.id,
            request.user_id,
            request.club_id,
            request.status as RequestStatus,
            request.message || undefined,
            request.admin_message || undefined,
            request.created_at,
            request.updated_at
          )
      );
    } catch (error) {
      throw new AppException(
        `Error finding club requests by user: ${(error as Error).message}`,
        500
      );
    }
  }

  async create(request: ClubRequest): Promise<ClubRequest> {
    try {
      const createdRequest = await this.prisma.club_requests.create({
        data: {
          id: request.id,
          user_id: request.userId,
          club_id: request.clubId,
          status: request.status,
          message: request.message || null,
          admin_message: request.adminMessage || null,
        },
      });

      return new ClubRequest(
        createdRequest.id,
        createdRequest.user_id,
        createdRequest.club_id,
        createdRequest.status as RequestStatus,
        createdRequest.message || undefined,
        createdRequest.admin_message || undefined,
        createdRequest.created_at,
        createdRequest.updated_at
      );
    } catch (error) {
      throw new AppException(
        `Error creating club request: ${(error as Error).message}`,
        500
      );
    }
  }

  async update(id: string, request: ClubRequest): Promise<ClubRequest> {
    try {
      const updatedRequest = await this.prisma.club_requests.update({
        where: { id },
        data: {
          status: request.status,
          admin_message: request.adminMessage || null,
          updated_at: new Date(),
        },
      });

      return new ClubRequest(
        updatedRequest.id,
        updatedRequest.user_id,
        updatedRequest.club_id,
        updatedRequest.status as RequestStatus,
        updatedRequest.message || undefined,
        updatedRequest.admin_message || undefined,
        updatedRequest.created_at,
        updatedRequest.updated_at
      );
    } catch (error) {
      throw new AppException(
        `Error updating club request: ${(error as Error).message}`,
        500
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.club_requests.delete({
        where: { id },
      });
    } catch (error) {
      throw new AppException(
        `Error deleting club request: ${(error as Error).message}`,
        500
      );
    }
  }

  async existsByUserAndClub(userId: string, clubId: string): Promise<boolean> {
    try {
      const request = await this.prisma.club_requests.findUnique({
        where: {
          user_id_club_id: {
            user_id: userId,
            club_id: clubId,
          },
        },
      });

      return !!request;
    } catch (error) {
      throw new AppException(
        `Error checking club request existence: ${(error as Error).message}`,
        500
      );
    }
  }
}
