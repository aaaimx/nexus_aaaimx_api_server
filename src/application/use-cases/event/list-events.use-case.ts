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
      const queryHandlers = {
        userId: () =>
          this.eventRepository.findByUserIdWithPagination(
            input.userId!,
            skip,
            limit
          ),
        status: () =>
          this.eventRepository.findByStatusWithPagination(
            input.status!,
            skip,
            limit
          ),
        eventType: () =>
          this.eventRepository.findByEventTypeWithPagination(
            input.eventType!,
            skip,
            limit
          ),
        organizer: () =>
          this.eventRepository.findByOrganizerWithPagination(
            input.organizerType!,
            input.organizerId!,
            skip,
            limit
          ),
        isPublic: () =>
          this.eventRepository.findPublicEventsWithPagination(skip, limit),
        upcomingOnly: () =>
          this.eventRepository.findUpcomingEventsWithPagination(skip, limit),
        dateRange: () =>
          this.eventRepository.findEventsByDateRangeWithPagination(
            input.startDate!,
            input.endDate!,
            skip,
            limit
          ),
        default: () => this.eventRepository.findAllWithPagination(skip, limit),
      };

      const getQueryKey = (): keyof typeof queryHandlers => {
        if (input.userId) return "userId";
        if (input.status) return "status";
        if (input.eventType) return "eventType";
        if (input.organizerType && input.organizerId) return "organizer";
        if (input.isPublic) return "isPublic";
        if (input.upcomingOnly) return "upcomingOnly";
        if (input.startDate && input.endDate) return "dateRange";
        return "default";
      };

      const result = await queryHandlers[getQueryKey()]();
      events = result.events;
      total = result.total;

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
