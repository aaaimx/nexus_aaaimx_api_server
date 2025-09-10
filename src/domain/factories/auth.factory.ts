import { SessionService } from "@/application/services/auth/session.service";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { IRoleRepository } from "@/domain/repositories/role.repository";
import JwtService from "@/infrastructure/external-services/jwt.service";
import { FileStorageService } from "@/infrastructure/external-services/file-storage.service";
import { UserRepository } from "@/infrastructure/orm/repositories/user.repository";
import { RoleRepository } from "@/infrastructure/orm/repositories/role.repository";
import prisma from "@/infrastructure/orm/prisma.client";
import { BaseFactory } from "./base.factory";

class AuthFactory extends BaseFactory {
  // Repository methods
  private static getUserRepository(): IUserRepository {
    return this.getSingleton(
      "UserRepository",
      () => new UserRepository(prisma as any)
    );
  }

  private static getRoleRepository(): IRoleRepository {
    return this.getSingleton(
      "RoleRepository",
      () => new RoleRepository(prisma as any)
    );
  }

  // Service methods
  private static getJwtService(): JwtService {
    return this.getSingleton("JwtService", () => new JwtService());
  }

  private static getFileStorageService(): FileStorageService {
    return this.getSingleton(
      "FileStorageService",
      () => new FileStorageService()
    );
  }

  private static getSessionService(): SessionService {
    return this.getSingleton(
      "SessionService",
      () => new SessionService(this.getUserRepository())
    );
  }

  // Public service accessors for middleware usage
  public static getJwtServiceInstance(): JwtService {
    return this.getJwtService();
  }

  public static getSessionServiceInstance(): SessionService {
    return this.getSessionService();
  }

  public static getUserRepositoryInstance(): IUserRepository {
    return this.getUserRepository();
  }

  public static getRoleRepositoryInstance(): IRoleRepository {
    return this.getRoleRepository();
  }

  public static getFileStorageServiceInstance(): FileStorageService {
    return this.getFileStorageService();
  }
}

export default AuthFactory;
