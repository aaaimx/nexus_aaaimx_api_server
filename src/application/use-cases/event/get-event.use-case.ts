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

      const includeHandlers = {
        sessions: async () => {
          output.sessions = await this.eventRepository.findEventSessions(
            input.eventId
          );
        },
        attendees: async () => {
          output.attendees = await this.eventRepository.findEventAttendees(
            input.eventId
          );
        },
        statistics: async () => {
          output.statistics =
            await this.eventBusinessService.getEventStatistics(input.eventId);
        },
      };

      const includeOptions = {
        sessions: input.includeSessions,
        attendees: input.includeAttendees,
        statistics: input.includeStatistics,
      };

      // Execute requested includes
      await Promise.all(
        Object.entries(includeOptions)
          .filter(([_, shouldInclude]) => shouldInclude)
          .map(([key, _]) =>
            includeHandlers[key as keyof typeof includeHandlers]()
          )
      );

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
