import { IEventRepository } from "@/domain/repositories/event.repository";
import { Event } from "@/domain/entities/event.entity";
import { EventMapper } from "@/domain/mappers/event.mapper";
import { EventValidationService } from "@/application/services/event/event-validation.service";
import { EventBusinessService } from "@/application/services/event/event-business.service";
import {
  EVENT_STATUS,
  EVENT_TYPE,
  ORGANIZER_TYPE,
  RECURRENCE_PATTERN,
} from "@/shared/constants";
import AppException from "@/shared/utils/exception.util";

export interface UpdateEventInput {
  eventId: string;
  userId: string;
  name?: string;
  description?: string;
  status?: keyof typeof EVENT_STATUS;
  eventType?: keyof typeof EVENT_TYPE;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  sessionDurationMinutes?: number;
  coverUrl?: string;
  location?: string;
  isPublic?: boolean;
  maxParticipants?: number;
  organizerType?: keyof typeof ORGANIZER_TYPE;
  organizerUserId?: string | null;
  organizerDivisionId?: string | null;
  organizerClubId?: string | null;
  externalOrganizerName?: string | null;
  isRecurring?: boolean;
  recurrencePattern?: keyof typeof RECURRENCE_PATTERN;
  recurrenceInterval?: number;
  recurrenceStartDate?: Date;
  recurrenceEndDate?: Date;
  recurrenceDays?: string;
}

export interface UpdateEventOutput {
  event: Event;
  message: string;
}

export class UpdateEventUseCase {
  private eventValidationService: EventValidationService;
  private eventBusinessService: EventBusinessService;

  constructor(private readonly eventRepository: IEventRepository) {
    this.eventValidationService = new EventValidationService(eventRepository);
    this.eventBusinessService = new EventBusinessService(eventRepository);
  }

  async execute(input: UpdateEventInput): Promise<UpdateEventOutput> {
    try {
      // Get existing event
      const existingEvent = await this.eventRepository.findById(input.eventId);
      if (!existingEvent) {
        throw new AppException("Event not found", 404);
      }

      // Validate user permissions
      this.eventValidationService.validateUserPermissions(
        input.userId,
        existingEvent,
        "update"
      );

      // Validate that event can be updated
      await this.eventValidationService.validateEventCanBeUpdated(
        input.eventId,
        input
      );

      // Prepare update data - only include defined values
      const filteredData = EventMapper.mapToEventData(input);

      // Validate updated data - only validate if there are changes
      if (Object.keys(filteredData).length > 0) {
        this.eventValidationService.validateEventData({
          ...existingEvent,
          ...filteredData,
        });
      }

      // Check for schedule conflicts (excluding current event)
      await this.eventValidationService.validateNoConflicts(
        { ...existingEvent, ...filteredData },
        input.eventId
      );

      // Update event
      const updatedEvent = await this.eventRepository.update(
        input.eventId,
        filteredData
      );

      // If recurrence settings changed, regenerate sessions
      const recurrenceChanged =
        input.isRecurring !== undefined ||
        input.recurrencePattern !== undefined ||
        input.recurrenceStartDate !== undefined ||
        input.recurrenceEndDate !== undefined;

      if (recurrenceChanged && updatedEvent.isRecurring) {
        // Delete existing sessions and regenerate
        const existingSessions = await this.eventRepository.findEventSessions(
          input.eventId
        );
        for (const session of existingSessions) {
          await this.eventRepository.deleteEventSession(session.id);
        }

        await this.eventBusinessService.generateEventSessions(updatedEvent);
      }

      return {
        event: updatedEvent,
        message: "Event updated successfully",
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(
        `Error updating event: ${(error as Error).message}`,
        500
      );
    }
  }
}
