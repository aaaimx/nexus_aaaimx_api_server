import { IEventRepository } from "@/domain/repositories/event.repository";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { IRoleRepository } from "@/domain/repositories/role.repository";
import { EventRepository } from "@/infrastructure/orm/repositories/event.repository";
import { UserRepository } from "@/infrastructure/orm/repositories/user.repository";
import { RoleRepository } from "@/infrastructure/orm/repositories/role.repository";
import { EventController } from "@/interfaces/controllers/event.controller";
import { CreateEventUseCase } from "@/application/use-cases/event/create-event.use-case";
import { GetEventUseCase } from "@/application/use-cases/event/get-event.use-case";
import { ListEventsUseCase } from "@/application/use-cases/event/list-events.use-case";
import { UpdateEventUseCase } from "@/application/use-cases/event/update-event.use-case";
import { DeleteEventUseCase } from "@/application/use-cases/event/delete-event.use-case";
import { RegisterForEventUseCase } from "@/application/use-cases/event/register-for-event.use-case";
import { CancelEventRegistrationUseCase } from "@/application/use-cases/event/cancel-event-registration.use-case";
import { EventValidationService } from "@/application/services/event/event-validation.service";
import { EventBusinessService } from "@/application/services/event/event-business.service";
import { BaseFactory } from "./base.factory";
import prisma from "@/infrastructure/orm/prisma.client";

export default class EventFactory extends BaseFactory {
  // Repository methods
  private static getEventRepository(): IEventRepository {
    return this.getSingleton(
      "EventRepository",
      () => new EventRepository(prisma as any)
    );
  }

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
  private static getEventValidationService(): EventValidationService {
    return this.getSingleton(
      "EventValidationService",
      () => new EventValidationService(this.getEventRepository())
    );
  }

  private static getEventBusinessService(): EventBusinessService {
    return this.getSingleton(
      "EventBusinessService",
      () => new EventBusinessService(this.getEventRepository())
    );
  }

  // Use case factories
  public static createCreateEventUseCase(): CreateEventUseCase {
    return new CreateEventUseCase(
      this.getEventRepository(),
      this.getUserRepository(),
      this.getRoleRepository()
    );
  }

  public static createGetEventUseCase(): GetEventUseCase {
    return new GetEventUseCase(this.getEventRepository());
  }

  public static createListEventsUseCase(): ListEventsUseCase {
    return new ListEventsUseCase(this.getEventRepository());
  }

  public static createUpdateEventUseCase(): UpdateEventUseCase {
    return new UpdateEventUseCase(this.getEventRepository());
  }

  public static createDeleteEventUseCase(): DeleteEventUseCase {
    return new DeleteEventUseCase(this.getEventRepository());
  }

  public static createRegisterForEventUseCase(): RegisterForEventUseCase {
    return new RegisterForEventUseCase(this.getEventRepository());
  }

  public static createCancelEventRegistrationUseCase(): CancelEventRegistrationUseCase {
    return new CancelEventRegistrationUseCase(this.getEventRepository());
  }

  // Controller factory
  public static createEventController(): EventController {
    return new EventController(
      this.getEventRepository(),
      this.getUserRepository(),
      this.getRoleRepository()
    );
  }

  // Public service accessors
  public static getEventRepositoryInstance(): IEventRepository {
    return this.getEventRepository();
  }

  public static getEventValidationServiceInstance(): EventValidationService {
    return this.getEventValidationService();
  }

  public static getEventBusinessServiceInstance(): EventBusinessService {
    return this.getEventBusinessService();
  }
}
