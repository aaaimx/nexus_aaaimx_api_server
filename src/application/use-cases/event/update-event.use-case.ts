import { IEventRepository } from "@/domain/repositories/event.repository";
import { Event } from "@/domain/entities/event.entity";
import { EventValidationService } from "@/application/services/event/event-validation.service";
import { EventBusinessService } from "@/application/services/event/event-business.service";
import AppException from "@/shared/utils/exception.util";

export interface UpdateEventInput {
  eventId: string;
  userId: string;
  name?: string;
  description?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "ONLINE";
  eventType?: "SINGLE" | "COURSE" | "WORKSHOP" | "RECURRING";
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  sessionDurationMinutes?: number;
  coverUrl?: string;
  location?: string;
  isPublic?: boolean;
  maxParticipants?: number;
  organizerType?: "USER" | "DIVISION" | "CLUB" | "EXTERNAL";
  organizerUserId?: string | null;
  organizerDivisionId?: string | null;
  organizerClubId?: string | null;
  externalOrganizerName?: string | null;
  isRecurring?: boolean;
  recurrencePattern?: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
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
      const updateData: Partial<Event> = {};

      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.eventType !== undefined) updateData.eventType = input.eventType;
      if (input.startDate !== undefined) updateData.startDate = input.startDate;
      if (input.endDate !== undefined) updateData.endDate = input.endDate;
      if (input.startTime !== undefined) updateData.startTime = input.startTime;
      if (input.endTime !== undefined) updateData.endTime = input.endTime;
      if (input.sessionDurationMinutes !== undefined)
        updateData.sessionDurationMinutes = input.sessionDurationMinutes;
      if (input.coverUrl !== undefined) updateData.coverUrl = input.coverUrl;
      if (input.location !== undefined) updateData.location = input.location;
      if (input.isPublic !== undefined) updateData.isPublic = input.isPublic;
      if (input.maxParticipants !== undefined)
        updateData.maxParticipants = input.maxParticipants;
      if (input.organizerType !== undefined)
        updateData.organizerType = input.organizerType;
      if (input.organizerUserId !== undefined)
        updateData.organizerUserId = input.organizerUserId;
      if (input.organizerDivisionId !== undefined)
        updateData.organizerDivisionId = input.organizerDivisionId;
      if (input.organizerClubId !== undefined)
        updateData.organizerClubId = input.organizerClubId;
      if (input.externalOrganizerName !== undefined)
        updateData.externalOrganizerName = input.externalOrganizerName;
      if (input.isRecurring !== undefined)
        updateData.isRecurring = input.isRecurring;
      if (input.recurrencePattern !== undefined)
        updateData.recurrencePattern = input.recurrencePattern;
      if (input.recurrenceInterval !== undefined)
        updateData.recurrenceInterval = input.recurrenceInterval;
      if (input.recurrenceStartDate !== undefined)
        updateData.recurrenceStartDate = input.recurrenceStartDate;
      if (input.recurrenceEndDate !== undefined)
        updateData.recurrenceEndDate = input.recurrenceEndDate;
      if (input.recurrenceDays !== undefined)
        updateData.recurrenceDays = input.recurrenceDays;

      // Remove undefined values
      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

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
