import { IEventRepository } from "@/domain/repositories/event.repository";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { IRoleRepository } from "@/domain/repositories/role.repository";
import { Event } from "@/domain/entities/event.entity";
import { EventValidationService } from "@/application/services/event/event-validation.service";
import { EventBusinessService } from "@/application/services/event/event-business.service";
import { RoleValidationService } from "@/application/services/auth/role-validation.service";
import AppException from "@/shared/utils/exception.util";

export interface CreateEventInput {
  name: string;
  description?: string;
  eventType: "SINGLE" | "COURSE" | "WORKSHOP" | "RECURRING";
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  sessionDurationMinutes?: number;
  coverUrl?: string;
  location?: string;
  isPublic?: boolean;
  maxParticipants?: number;
  organizerType: "USER" | "DIVISION" | "CLUB" | "EXTERNAL";
  organizerUserId?: string;
  organizerDivisionId?: string;
  organizerClubId?: string;
  externalOrganizerName?: string;
  isRecurring?: boolean;
  recurrencePattern?: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
  recurrenceInterval?: number;
  recurrenceStartDate?: Date;
  recurrenceEndDate?: Date;
  recurrenceDays?: string;
  userId: string;
}

export interface CreateEventOutput {
  event: Event;
  message: string;
}

export class CreateEventUseCase {
  private eventValidationService: EventValidationService;
  private eventBusinessService: EventBusinessService;
  private roleValidationService: RoleValidationService;

  constructor(
    private readonly eventRepository: IEventRepository,
    userRepository: IUserRepository,
    roleRepository: IRoleRepository
  ) {
    this.eventValidationService = new EventValidationService(eventRepository);
    this.eventBusinessService = new EventBusinessService(eventRepository);
    this.roleValidationService = new RoleValidationService(
      userRepository,
      roleRepository
    );
  }

  async execute(input: CreateEventInput): Promise<CreateEventOutput> {
    try {
      // Validate user has permission to create events
      await this.roleValidationService.validateEventCreationPermission(
        input.userId
      );

      // Validate input data
      this.eventValidationService.validateEventData(input);

      // Check for schedule conflicts
      await this.eventValidationService.validateNoConflicts(input);

      // Create event - only include defined values
      const eventData: Partial<Event> = {
        name: input.name,
        status: "DRAFT",
        eventType: input.eventType,
        userId: input.userId,
      };

      if (input.description !== undefined)
        eventData.description = input.description;
      if (input.startDate !== undefined) eventData.startDate = input.startDate;
      if (input.endDate !== undefined) eventData.endDate = input.endDate;
      if (input.startTime !== undefined) eventData.startTime = input.startTime;
      if (input.endTime !== undefined) eventData.endTime = input.endTime;
      if (input.sessionDurationMinutes !== undefined)
        eventData.sessionDurationMinutes = input.sessionDurationMinutes;
      if (input.coverUrl !== undefined) eventData.coverUrl = input.coverUrl;
      if (input.location !== undefined) eventData.location = input.location;
      if (input.isPublic !== undefined) eventData.isPublic = input.isPublic;
      if (input.maxParticipants !== undefined)
        eventData.maxParticipants = input.maxParticipants;
      if (input.organizerType !== undefined)
        eventData.organizerType = input.organizerType;
      if (input.organizerUserId !== undefined)
        eventData.organizerUserId = input.organizerUserId;
      if (input.organizerDivisionId !== undefined)
        eventData.organizerDivisionId = input.organizerDivisionId;
      if (input.organizerClubId !== undefined)
        eventData.organizerClubId = input.organizerClubId;
      if (input.externalOrganizerName !== undefined)
        eventData.externalOrganizerName = input.externalOrganizerName;
      if (input.isRecurring !== undefined)
        eventData.isRecurring = input.isRecurring;
      if (input.recurrencePattern !== undefined)
        eventData.recurrencePattern = input.recurrencePattern;
      if (input.recurrenceInterval !== undefined)
        eventData.recurrenceInterval = input.recurrenceInterval;
      if (input.recurrenceStartDate !== undefined)
        eventData.recurrenceStartDate = input.recurrenceStartDate;
      if (input.recurrenceEndDate !== undefined)
        eventData.recurrenceEndDate = input.recurrenceEndDate;
      if (input.recurrenceDays !== undefined)
        eventData.recurrenceDays = input.recurrenceDays;

      const event = await this.eventRepository.create(eventData);

      // Generate sessions for multi-day and recurring events
      await this.eventBusinessService.generateEventSessions(event);

      return {
        event,
        message: "Event created successfully",
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(
        `Error creating event: ${(error as Error).message}`,
        500
      );
    }
  }
}
