import { Club } from "../entities";

export interface CreateClubData {
  name: string;
  description?: string;
  logoUrl?: string;
}

export interface UpdateClubData {
  name?: string;
  description?: string;
  logoUrl?: string;
}

export interface IClubRepository {
  findAll(): Promise<Club[]>;
  findById(id: string): Promise<Club | null>;
  findByName(name: string): Promise<Club | null>;
  create(data: CreateClubData): Promise<Club>;
  update(id: string, data: UpdateClubData): Promise<Club>;
  delete(id: string): Promise<void>;
}
