import { IEventRepository } from "@/domain/repositories/event.repository";
import { EventValidationService } from "@/application/services/event/event-validation.service";
import AppException from "@/shared/utils/exception.util";

export interface DeleteEventInput {
  eventId: string;
  userId: string;
}

export interface DeleteEventOutput {
  message: string;
}

export class DeleteEventUseCase {
  private eventValidationService: EventValidationService;

  constructor(private readonly eventRepository: IEventRepository) {
    this.eventValidationService = new EventValidationService(eventRepository);
  }

  async execute(input: DeleteEventInput): Promise<DeleteEventOutput> {
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
        "delete"
      );

      // Check if event has attendees
      const attendeeCount = await this.eventRepository.countEventAttendees(
        input.eventId
      );
      if (attendeeCount > 0) {
        throw new AppException(
          "Cannot delete event with registered attendees. Please archive the event instead.",
          400
        );
      }

      // Delete event (this will cascade delete sessions and attendees)
      await this.eventRepository.delete(input.eventId);

      return {
        message: "Event deleted successfully",
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(
        `Error deleting event: ${(error as Error).message}`,
        500
      );
    }
  }
}
