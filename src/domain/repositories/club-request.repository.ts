import { ClubRequest } from "@/domain/entities/club-request.entity";

export interface IClubRequestRepository {
  findById(id: string): Promise<ClubRequest | null>;
  findByUserAndClub(userId: string, clubId: string): Promise<ClubRequest | null>;
  findByClub(clubId: string): Promise<ClubRequest[]>;
  findByUser(userId: string): Promise<ClubRequest[]>;
  create(request: ClubRequest): Promise<ClubRequest>;
  update(id: string, request: ClubRequest): Promise<ClubRequest>;
  delete(id: string): Promise<void>;
  existsByUserAndClub(userId: string, clubId: string): Promise<boolean>;
}
