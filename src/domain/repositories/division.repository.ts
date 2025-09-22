import { Division } from "../entities";

export interface CreateDivisionData {
  name: string;
  description?: string;
  logoUrl?: string;
}

export interface UpdateDivisionData {
  name?: string;
  description?: string;
  logoUrl?: string;
}

export interface IDivisionRepository {
  findAll(): Promise<Division[]>;
  findById(id: string): Promise<Division | null>;
  findByName(name: string): Promise<Division | null>;
  create(data: CreateDivisionData): Promise<Division>;
  update(id: string, data: UpdateDivisionData): Promise<Division>;
  delete(id: string): Promise<void>;
}
