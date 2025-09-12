import { Club } from "../entities";

export interface IClubRepository {
  findAll(): Promise<Club[]>;
  findById(id: string): Promise<Club | null>;
  findByName(name: string): Promise<Club | null>;
}
