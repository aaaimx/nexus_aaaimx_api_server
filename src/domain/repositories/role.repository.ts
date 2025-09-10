import { Role } from "@/domain/entities/role.entity";

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findDefault(): Promise<Role>;
  findAll(): Promise<Role[]>;
  create(role: Partial<Role>): Promise<Role>;
  update(id: string, role: Partial<Role>): Promise<Role>;
  delete(id: string): Promise<void>;
}
