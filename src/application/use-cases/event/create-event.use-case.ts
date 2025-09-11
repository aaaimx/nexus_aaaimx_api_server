import { IEventRepository } from "@/domain/repositories/event.repository";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { IRoleRepository } from "@/domain/repositories/role.repository";
import { Event } from "@/domain/entities/event.entity";
import { EventMapper } from "@/domain/mappers/event.mapper";
import { EventValidationService } from "@/application/services/event/event-validation.service";
import { EventBusinessService } from "@/application/services/event/event-business.service";
import { RoleValidationService } from "@/application/services/auth/role-validation.service";
import {
  EVENT_STATUS,
  EVENT_TYPE,
  ORGANIZER_TYPE,
  RECURRENCE_PATTERN,
} from "@/shared/constants";
import AppException from "@/shared/utils/exception.util";

export interface CreateEventInput {
  name: string;
  description?: string;
  eventType: keyof typeof EVENT_TYPE;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  sessionDurationMinutes?: number;
  coverUrl?: string;
  location?: string;
  isPublic?: boolean;
  maxParticipants?: number;
  organizerType: keyof typeof ORGANIZER_TYPE;
  organizerUserId?: string;
  organizerDivisionId?: string;
  organizerClubId?: string;
  externalOrganizerName?: string;
  isRecurring?: boolean;
  recurrencePattern?: keyof typeof RECURRENCE_PATTERN;
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
      const eventData = EventMapper.mapToEventData(input, {
        name: input.name,
        status: EVENT_STATUS.DRAFT,
        eventType: EVENT_TYPE[input.eventType],
        userId: input.userId,
      });

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
