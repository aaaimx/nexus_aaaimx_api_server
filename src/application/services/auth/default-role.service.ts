import { Role } from "@/domain/entities/role.entity";
import { IRoleRepository } from "@/domain/repositories/role.repository";
import AppException from "@/shared/utils/exception.util";

export default class DefaultRoleService {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async getDefaultRole(): Promise<Role> {
    const role = await this.roleRepository.findByName("member");
    if (!role) {
      throw new AppException("Default role not found", 404);
    }
    return role;
  }

  async getRoleByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findByName(name);
    if (!role) {
      throw new AppException(`Role '${name}' not found`, 404);
    }
    return role;
  }
}
