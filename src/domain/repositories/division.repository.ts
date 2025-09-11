import { Division } from "../entities";

export interface IDivisionRepository {
  findAll(): Promise<Division[]>;
  findById(id: string): Promise<Division | null>;
  findByName(name: string): Promise<Division | null>;
}
