import { GoogleAuthUseCase } from "@/application/use-cases/auth/google-auth.use-case";
import { IRoleRepository } from "@/domain/repositories/role.repository";
import { IUserRepository } from "@/domain/repositories/user.repository";
import GoogleOAuthService from "@/infrastructure/external-services/google-oauth.service";
import MailService from "@/infrastructure/external-services/mail.service";
import { RoleRepository } from "@/infrastructure/orm/repositories/role.repository";
import { UserRepository } from "@/infrastructure/orm/repositories/user.repository";
import prisma from "@/infrastructure/orm/prisma.client";
import { BaseFactory } from "./base.factory";

export default class GoogleAuthFactory extends BaseFactory {
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
  private static getGoogleOAuthService(): GoogleOAuthService {
    return this.getSingleton(
      "GoogleOAuthService",
      () => new GoogleOAuthService()
    );
  }

  private static getMailService(): MailService {
    return this.getSingleton(
      "MailService",
      () => new MailService(this.getUserRepository())
    );
  }

  // Public service accessors
  public static getGoogleOAuthServiceInstance(): GoogleOAuthService {
    return this.getGoogleOAuthService();
  }

  // Use case factories
  public static createGoogleAuthUseCase(): GoogleAuthUseCase {
    return new GoogleAuthUseCase(
      this.getUserRepository(),
      this.getMailService(),
      this.getRoleRepository()
    );
  }
}
