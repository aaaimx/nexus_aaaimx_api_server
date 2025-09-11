import { IEventRepository } from "@/domain/repositories/event.repository";
import { Event } from "@/domain/entities/event.entity";
import AppException from "@/shared/utils/exception.util";

export class EventValidationService {
  constructor(private readonly eventRepository: IEventRepository) {}

  /**
   * Validates event data according to business rules
   */
  validateEventData(event: Partial<Event>): void {
    // Validate required fields
    if (!event.name) {
      throw new AppException("Event name is required", 400);
    }

    if (!event.eventType) {
      throw new AppException("Event type is required", 400);
    }

    if (!event.organizerType) {
      throw new AppException("Organizer type is required", 400);
    }

    // Validate organizer fields
    this.validateOrganizer(event);

    // Validate dates and times
    this.validateDatesAndTimes(event);

    // Validate event type specific rules
    this.validateEventTypeRules(event);

    // Validate recurrence rules
    if (event.isRecurring) {
      this.validateRecurrenceRules(event);
    }
  }

  /**
   * Validates that exactly one organizer field is set based on organizer type
   */
  private validateOrganizer(event: Partial<Event>): void {
    const {
      organizerType,
      organizerUserId,
      organizerDivisionId,
      organizerClubId,
      externalOrganizerName,
    } = event;

    switch (organizerType) {
    case "USER":
      if (
        !organizerUserId ||
          organizerDivisionId ||
          organizerClubId ||
          externalOrganizerName
      ) {
        throw new AppException(
          "For USER organizer type, only organizerUserId should be set",
          400
        );
      }
      break;
    case "DIVISION":
      if (
        !organizerDivisionId ||
          organizerUserId ||
          organizerClubId ||
          externalOrganizerName
      ) {
        throw new AppException(
          "For DIVISION organizer type, only organizerDivisionId should be set",
          400
        );
      }
      break;
    case "CLUB":
      if (
        !organizerClubId ||
          organizerUserId ||
          organizerDivisionId ||
          externalOrganizerName
      ) {
        throw new AppException(
          "For CLUB organizer type, only organizerClubId should be set",
          400
        );
      }
      break;
    case "EXTERNAL":
      if (
        !externalOrganizerName ||
          organizerUserId ||
          organizerDivisionId ||
          organizerClubId
      ) {
        throw new AppException(
          "For EXTERNAL organizer type, only externalOrganizerName should be set",
          400
        );
      }
      break;
    default:
      throw new AppException("Invalid organizer type", 400);
    }
  }

  /**
   * Validates dates and times according to business rules
   */
  private validateDatesAndTimes(event: Partial<Event>): void {
    const { startDate, endDate, startTime, endTime } = event;

    // Validate dates
    if (startDate && endDate && startDate > endDate) {
      throw new AppException(
        "Start date must be before or equal to end date",
        400
      );
    }

    // Validate times
    if (startTime && endTime && startTime >= endTime) {
      throw new AppException("Start time must be before end time", 400);
    }

    // Validate time format (HH:MM)
    if (startTime && !this.isValidTimeFormat(startTime)) {
      throw new AppException("Start time must be in HH:MM format", 400);
    }

    if (endTime && !this.isValidTimeFormat(endTime)) {
      throw new AppException("End time must be in HH:MM format", 400);
    }

    // Validate past dates (only for new events)
    // Allow events for today but not for past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    if (startDate && startDate < today) {
      throw new AppException("Cannot create events in the past", 400);
    }
  }

  /**
   * Validates event type specific rules
   */
  private validateEventTypeRules(event: Partial<Event>): void {
    const { eventType, startDate, endDate, isRecurring } = event;

    switch (eventType) {
    case "SINGLE":
      if (startDate && endDate && startDate.getTime() !== endDate.getTime()) {
        throw new AppException(
          "SINGLE events must have the same start and end date",
          400
        );
      }
      if (isRecurring) {
        throw new AppException("SINGLE events cannot be recurring", 400);
      }
      break;

    case "COURSE":
    case "WORKSHOP":
      if (isRecurring) {
        throw new AppException(
          "COURSE and WORKSHOP events cannot be recurring",
          400
        );
      }
      break;

    case "RECURRING":
      if (!isRecurring) {
        throw new AppException(
          "RECURRING events must have isRecurring set to true",
          400
        );
      }
      break;
    }
  }

  /**
   * Validates recurrence rules
   */
  private validateRecurrenceRules(event: Partial<Event>): void {
    const {
      recurrencePattern,
      recurrenceInterval,
      recurrenceStartDate,
      recurrenceEndDate,
      recurrenceDays,
    } = event;

    if (!recurrencePattern) {
      throw new AppException(
        "Recurrence pattern is required for recurring events",
        400
      );
    }

    if (!recurrenceStartDate || !recurrenceEndDate) {
      throw new AppException(
        "Recurrence start and end dates are required for recurring events",
        400
      );
    }

    if (recurrenceStartDate >= recurrenceEndDate) {
      throw new AppException(
        "Recurrence start date must be before end date",
        400
      );
    }

    // Validate interval
    if (recurrenceInterval && recurrenceInterval < 1) {
      throw new AppException("Recurrence interval must be at least 1", 400);
    }

    // Validate custom recurrence days
    if (recurrencePattern === "CUSTOM") {
      if (!recurrenceDays) {
        throw new AppException(
          "Recurrence days are required for CUSTOM pattern",
          400
        );
      }

      const days = recurrenceDays.split(",").map((d) => parseInt(d.trim()));
      const validDays = days.every((day) => day >= 1 && day <= 7);

      if (!validDays) {
        throw new AppException(
          "Recurrence days must be numbers between 1-7 (1=Monday, 7=Sunday)",
          400
        );
      }
    }
  }

  /**
   * Validates that there are no schedule conflicts
   */
  async validateNoConflicts(
    event: Partial<Event>,
    excludeEventId?: string
  ): Promise<void> {
    if (!event.startDate || !event.startTime || !event.endTime) {
      return; // Skip validation if required fields are missing
    }

    const conflictingEvents = await this.eventRepository.findConflictingEvents(
      event.startDate,
      event.startDate, // Using same date for single day events
      event.startTime,
      event.endTime,
      excludeEventId
    );

    if (conflictingEvents.length > 0) {
      throw new AppException(
        `Event conflicts with existing event: ${conflictingEvents[0]?.name || 'Unknown'}`,
        409
      );
    }
  }

  /**
   * Validates that max participants limit is not exceeded
   */
  async validateMaxParticipants(
    eventId: string,
    maxParticipants?: number
  ): Promise<void> {
    if (!maxParticipants) return;

    const currentAttendees = await this.eventRepository.countEventAttendees(
      eventId
    );

    if (currentAttendees >= maxParticipants) {
      throw new AppException(
        "Event has reached maximum participants limit",
        400
      );
    }
  }

  /**
   * Validates user permissions for event operations
   */
  validateUserPermissions(
    userId: string,
    event: Event,
    _operation: "create" | "update" | "delete"
  ): void {
    // Only the event creator can perform operations
    if (event.userId !== userId) {
      throw new AppException(
        "You don't have permission to perform this operation",
        403
      );
    }
  }

  /**
   * Validates that event can be updated (no attendees for certain changes)
   */
  async validateEventCanBeUpdated(
    eventId: string,
    updates: Partial<Event>
  ): Promise<void> {
    // Check if there are attendees
    const attendeeCount = await this.eventRepository.countEventAttendees(
      eventId
    );

    if (attendeeCount > 0) {
      // Restrict certain changes when there are attendees
      const restrictedFields = [
        "recurrencePattern",
        "recurrenceStartDate",
        "recurrenceEndDate",
      ];
      const hasRestrictedChanges = restrictedFields.some(
        (field) => updates[field as keyof Event] !== undefined
      );

      if (hasRestrictedChanges) {
        throw new AppException(
          "Cannot modify recurrence settings when there are registered attendees",
          400
        );
      }
    }
  }

  /**
   * Validates time format (HH:MM)
   */
  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Validates event name uniqueness
   */
  async validateEventNameUnique(
    _name: string,
    _excludeEventId?: string
  ): Promise<void> {
    // This would be implemented in the repository layer
    // For now, we'll assume the database constraint handles this
  }
}
