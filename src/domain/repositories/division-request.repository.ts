import { DivisionRequest } from "@/domain/entities/division-request.entity";

export interface IDivisionRequestRepository {
  findById(id: string): Promise<DivisionRequest | null>;
  findByUserAndDivision(userId: string, divisionId: string): Promise<DivisionRequest | null>;
  findByDivision(divisionId: string): Promise<DivisionRequest[]>;
  findByUser(userId: string): Promise<DivisionRequest[]>;
  create(request: DivisionRequest): Promise<DivisionRequest>;
  update(id: string, request: DivisionRequest): Promise<DivisionRequest>;
  delete(id: string): Promise<void>;
  existsByUserAndDivision(userId: string, divisionId: string): Promise<boolean>;
}
