import { IEventRepository } from "@/domain/repositories/event.repository";
import { Event } from "@/domain/entities/event.entity";
import PaginationUtil, {
  PaginationResult,
} from "@/shared/utils/pagination.util";
import AppException from "@/shared/utils/exception.util";

export interface ListEventsInput {
  userId?: string;
  status?: string;
  eventType?: string;
  organizerType?: string;
  organizerId?: string;
  isPublic?: boolean;
  upcomingOnly?: boolean;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface ListEventsOutput extends PaginationResult<Event> {}

export class ListEventsUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(input: ListEventsInput): Promise<ListEventsOutput> {
    try {
      // Parse pagination options
      const paginationOptions = PaginationUtil.parseQuery(
        input as Record<string, unknown>
      );
      const { skip, limit, page } = PaginationUtil.calculatePagination(
        paginationOptions.page,
        paginationOptions.limit
      );

      let events: Event[] = [];
      let total: number = 0;

      // Determine which query method to use based on filters
      if (input.userId) {
        const result = await this.eventRepository.findByUserIdWithPagination(
          input.userId,
          skip,
          limit
        );
        events = result.events;
        total = result.total;
      } else if (input.status) {
        const result = await this.eventRepository.findByStatusWithPagination(
          input.status,
          skip,
          limit
        );
        events = result.events;
        total = result.total;
      } else if (input.eventType) {
        const result = await this.eventRepository.findByEventTypeWithPagination(
          input.eventType,
          skip,
          limit
        );
        events = result.events;
        total = result.total;
      } else if (input.organizerType && input.organizerId) {
        const result = await this.eventRepository.findByOrganizerWithPagination(
          input.organizerType,
          input.organizerId,
          skip,
          limit
        );
        events = result.events;
        total = result.total;
      } else if (input.isPublic) {
        const result =
          await this.eventRepository.findPublicEventsWithPagination(
            skip,
            limit
          );
        events = result.events;
        total = result.total;
      } else if (input.upcomingOnly) {
        const result =
          await this.eventRepository.findUpcomingEventsWithPagination(
            skip,
            limit
          );
        events = result.events;
        total = result.total;
      } else if (input.startDate && input.endDate) {
        const result =
          await this.eventRepository.findEventsByDateRangeWithPagination(
            input.startDate,
            input.endDate,
            skip,
            limit
          );
        events = result.events;
        total = result.total;
      } else {
        const result = await this.eventRepository.findAllWithPagination(
          skip,
          limit
        );
        events = result.events;
        total = result.total;
      }

      // Format result using pagination utility
      return PaginationUtil.formatResult(events, total, page, limit);
    } catch (error) {
      throw new AppException(
        `Error listing events: ${(error as Error).message}`,
        500
      );
    }
  }
}
