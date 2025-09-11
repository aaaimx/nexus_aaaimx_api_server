import { IEventRepository } from "@/domain/repositories/event.repository";
import {
  Event,
  EventSession,
  EventAttendee,
} from "@/domain/entities/event.entity";
import { EventBusinessService } from "@/application/services/event/event-business.service";
import AppException from "@/shared/utils/exception.util";

export interface GetEventInput {
  eventId: string;
  includeSessions?: boolean;
  includeAttendees?: boolean;
  includeStatistics?: boolean;
}

export interface GetEventOutput {
  event: Event;
  sessions?: EventSession[];
  attendees?: EventAttendee[];
  statistics?: {
    totalAttendees: number;
    registeredAttendees: number;
    cancelledAttendees: number;
    availableSlots?: number;
  };
}

export class GetEventUseCase {
  private eventBusinessService: EventBusinessService;

  constructor(private readonly eventRepository: IEventRepository) {
    this.eventBusinessService = new EventBusinessService(eventRepository);
  }

  async execute(input: GetEventInput): Promise<GetEventOutput> {
    try {
      const event = await this.eventRepository.findById(input.eventId);

      if (!event) {
        throw new AppException("Event not found", 404);
      }

      const output: GetEventOutput = { event };

      // Include sessions if requested
      if (input.includeSessions) {
        output.sessions = await this.eventRepository.findEventSessions(
          input.eventId
        );
      }

      // Include attendees if requested
      if (input.includeAttendees) {
        output.attendees = await this.eventRepository.findEventAttendees(
          input.eventId
        );
      }

      // Include statistics if requested
      if (input.includeStatistics) {
        output.statistics = await this.eventBusinessService.getEventStatistics(
          input.eventId
        );
      }

      return output;
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(
        `Error getting event: ${(error as Error).message}`,
        500
      );
    }
  }
}
