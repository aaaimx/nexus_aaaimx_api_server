import {
  Event,
  EventSession,
  EventAttendee,
} from "@/domain/entities/event.entity";

export interface IEventRepository {
  // Basic CRUD operations
  findById(id: string): Promise<Event | null>;
  findAll(): Promise<Event[]>;
  create(event: Partial<Event>): Promise<Event>;
  update(id: string, event: Partial<Event>): Promise<Event>;
  delete(id: string): Promise<void>;

  // Query operations
  findByUserId(userId: string): Promise<Event[]>;
  findByStatus(status: string): Promise<Event[]>;
  findByEventType(eventType: string): Promise<Event[]>;
  findByOrganizer(organizerType: string, organizerId: string): Promise<Event[]>;
  findPublicEvents(): Promise<Event[]>;
  findUpcomingEvents(): Promise<Event[]>;
  findEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]>;

  // Paginated query operations
  findByUserIdWithPagination(
    userId: string,
    skip: number,
    limit: number
  ): Promise<{ events: Event[]; total: number }>;
  findByStatusWithPagination(
    status: string,
    skip: number,
    limit: number
  ): Promise<{ events: Event[]; total: number }>;
  findByEventTypeWithPagination(
    eventType: string,
    skip: number,
    limit: number
  ): Promise<{ events: Event[]; total: number }>;
  findByOrganizerWithPagination(
    organizerType: string,
    organizerId: string,
    skip: number,
    limit: number
  ): Promise<{ events: Event[]; total: number }>;
  findPublicEventsWithPagination(
    skip: number,
    limit: number
  ): Promise<{ events: Event[]; total: number }>;
  findUpcomingEventsWithPagination(
    skip: number,
    limit: number
  ): Promise<{ events: Event[]; total: number }>;
  findEventsByDateRangeWithPagination(
    startDate: Date,
    endDate: Date,
    skip: number,
    limit: number
  ): Promise<{ events: Event[]; total: number }>;
  findAllWithPagination(
    skip: number,
    limit: number
  ): Promise<{ events: Event[]; total: number }>;

  // Conflict detection
  findConflictingEvents(
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string,
    excludeEventId?: string
  ): Promise<Event[]>;

  // Event sessions
  createEventSession(session: Partial<EventSession>): Promise<EventSession>;
  findEventSessions(eventId: string): Promise<EventSession[]>;
  updateEventSession(
    id: string,
    session: Partial<EventSession>
  ): Promise<EventSession>;
  deleteEventSession(id: string): Promise<void>;

  // Event attendees
  createEventAttendee(attendee: Partial<EventAttendee>): Promise<EventAttendee>;
  findEventAttendees(eventId: string): Promise<EventAttendee[]>;
  findUserEventAttendance(
    userId: string,
    eventId: string
  ): Promise<EventAttendee | null>;
  updateEventAttendee(
    id: string,
    attendee: Partial<EventAttendee>
  ): Promise<EventAttendee>;
  deleteEventAttendee(id: string): Promise<void>;
  findUserEventAttendances(userId: string): Promise<EventAttendee[]>;

  // Business logic queries
  countEventAttendees(eventId: string): Promise<number>;
  findEventsWithAvailableSlots(): Promise<Event[]>;
}
