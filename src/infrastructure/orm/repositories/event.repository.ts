import { PrismaClient } from "@prisma/client";
import {
  Event,
  EventSession,
  EventAttendee,
} from "@/domain/entities/event.entity";
import { IEventRepository } from "@/domain/repositories/event.repository";
import {
  EVENT_STATUS,
  ORGANIZER_TYPE,
  ATTENDEE_STATUS,
} from "@/shared/constants";
import AppException from "@/shared/utils/exception.util";

export class EventRepository implements IEventRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private filterUndefined<T extends Record<string, any>>(
    obj: T
  ): Record<string, any> {
    const filtered: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        filtered[key] = value;
      }
    }
    return filtered;
  }

  async findById(id: string): Promise<Event | null> {
    try {
      const event = await this.prisma.events.findUnique({
        where: { id },
        include: {
          organizer_user: true,
          organizer_division: true,
          organizer_club: true,
        },
      });

      if (!event) return null;

      return this.mapToEventEntity(event);
    } catch (error) {
      throw new AppException(
        `Error finding event by ID: ${(error as Error).message}`,
        500
      );
    }
  }

  async findAll(): Promise<Event[]> {
    try {
      const events = await this.prisma.events.findMany({
        include: {
          organizer_user: true,
          organizer_division: true,
          organizer_club: true,
        },
        orderBy: { created_at: "desc" },
      });

      return events.map((event) => this.mapToEventEntity(event));
    } catch (error) {
      throw new AppException(
        `Error finding all events: ${(error as Error).message}`,
        500
      );
    }
  }

  async create(event: Partial<Event>): Promise<Event> {
    try {
      const filteredData = this.filterUndefined({
        name: event.name,
        description: event.description,
        status: event.status,
        event_type: event.eventType,
        start_date: event.startDate,
        end_date: event.endDate,
        is_recurring: event.isRecurring,
        recurrence_pattern: event.recurrencePattern,
        recurrence_interval: event.recurrenceInterval,
        recurrence_start_date: event.recurrenceStartDate,
        recurrence_end_date: event.recurrenceEndDate,
        recurrence_days: event.recurrenceDays,
        session_duration_minutes: event.sessionDurationMinutes,
        start_time: event.startTime,
        end_time: event.endTime,
        cover_url: event.coverUrl,
        location: event.location,
        is_public: event.isPublic,
        max_participants: event.maxParticipants,
        organizer_type: event.organizerType,
        organizer_user_id: event.organizerUserId,
        organizer_division_id: event.organizerDivisionId,
        organizer_club_id: event.organizerClubId,
        external_organizer_name: event.externalOrganizerName,
        user_id: event.userId,
      });

      const createdEvent = await this.prisma.events.create({
        data: filteredData as any,
        include: {
          organizer_user: true,
          organizer_division: true,
          organizer_club: true,
        },
      });

      return this.mapToEventEntity(createdEvent);
    } catch (error) {
      throw new AppException(
        `Error creating event: ${(error as Error).message}`,
        500
      );
    }
  }

  async update(id: string, event: Partial<Event>): Promise<Event> {
    try {
      const eventData = this.filterUndefined({
        name: event.name,
        description: event.description,
        status: event.status,
        event_type: event.eventType,
        start_date: event.startDate,
        end_date: event.endDate,
        is_recurring: event.isRecurring,
        recurrence_pattern: event.recurrencePattern,
        recurrence_interval: event.recurrenceInterval,
        recurrence_start_date: event.recurrenceStartDate,
        recurrence_end_date: event.recurrenceEndDate,
        recurrence_days: event.recurrenceDays,
        session_duration_minutes: event.sessionDurationMinutes,
        start_time: event.startTime,
        end_time: event.endTime,
        cover_url: event.coverUrl,
        location: event.location,
        is_public: event.isPublic,
        max_participants: event.maxParticipants,
        organizer_type: event.organizerType,
        organizer_user_id: event.organizerUserId,
        organizer_division_id: event.organizerDivisionId,
        organizer_club_id: event.organizerClubId,
        external_organizer_name: event.externalOrganizerName,
      });

      const updatedEvent = await this.prisma.events.update({
        where: { id },
        data: eventData,
        include: {
          organizer_user: true,
          organizer_division: true,
          organizer_club: true,
        },
      });

      return this.mapToEventEntity(updatedEvent);
    } catch (error) {
      throw new AppException(
        `Error updating event: ${(error as Error).message}`,
        500
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Use transaction to delete related records first
      await this.prisma.$transaction(async (tx) => {
        // Delete event attendees first
        await tx.event_attendees.deleteMany({
          where: { event_id: id },
        });

        // Delete event sessions
        await tx.event_sessions.deleteMany({
          where: { event_id: id },
        });

        // Finally delete the event
        await tx.events.delete({
          where: { id },
        });
      });
    } catch (error) {
      throw new AppException(
        `Error deleting event: ${(error as Error).message}`,
        500
      );
    }
  }

  async findByUserId(userId: string): Promise<Event[]> {
    try {
      const events = await this.prisma.events.findMany({
        where: { user_id: userId },
        include: {
          organizer_user: true,
          organizer_division: true,
          organizer_club: true,
        },
        orderBy: { created_at: "desc" },
      });

      return events.map((event) => this.mapToEventEntity(event));
    } catch (error) {
      throw new AppException(
        `Error finding events by user ID: ${(error as Error).message}`,
        500
      );
    }
  }

  async findByStatus(status: string): Promise<Event[]> {
    try {
      const events = await this.prisma.events.findMany({
        where: { status: status as any },
        include: {
          organizer_user: true,
          organizer_division: true,
          organizer_club: true,
        },
        orderBy: { created_at: "desc" },
      });

      return events.map((event) => this.mapToEventEntity(event));
    } catch (error) {
      throw new AppException(
        `Error finding events by status: ${(error as Error).message}`,
        500
      );
    }
  }

  async findByEventType(eventType: string): Promise<Event[]> {
    try {
      const events = await this.prisma.events.findMany({
        where: { event_type: eventType as any },
        include: {
          organizer_user: true,
          organizer_division: true,
          organizer_club: true,
        },
        orderBy: { created_at: "desc" },
      });

      return events.map((event) => this.mapToEventEntity(event));
    } catch (error) {
      throw new AppException(
        `Error finding events by type: ${(error as Error).message}`,
        500
      );
    }
  }

  async findByOrganizer(
    organizerType: string,
    organizerId: string
  ): Promise<Event[]> {
    try {
      const whereClause: any = { organizer_type: organizerType as any };

      if (organizerType === ORGANIZER_TYPE.USER) {
        whereClause.organizer_user_id = organizerId;
      } else if (organizerType === ORGANIZER_TYPE.DIVISION) {
        whereClause.organizer_division_id = organizerId;
      } else if (organizerType === ORGANIZER_TYPE.CLUB) {
        whereClause.organizer_club_id = organizerId;
      }

      const events = await this.prisma.events.findMany({
        where: whereClause,
        include: {
          organizer_user: true,
          organizer_division: true,
          organizer_club: true,
        },
        orderBy: { created_at: "desc" },
      });

      return events.map((event) => this.mapToEventEntity(event));
    } catch (error) {
      throw new AppException(
        `Error finding events by organizer: ${(error as Error).message}`,
        500
      );
    }
  }

  async findPublicEvents(): Promise<Event[]> {
    try {
      const events = await this.prisma.events.findMany({
        where: {
          is_public: true,
          status: { in: [EVENT_STATUS.PUBLISHED, EVENT_STATUS.ONLINE] },
        },
        include: {
          organizer_user: true,
          organizer_division: true,
          organizer_club: true,
        },
        orderBy: { created_at: "desc" },
      });

      return events.map((event) => this.mapToEventEntity(event));
    } catch (error) {
      throw new AppException(
        `Error finding public events: ${(error as Error).message}`,
        500
      );
    }
  }

  async findUpcomingEvents(): Promise<Event[]> {
    try {
      const now = new Date();
      const events = await this.prisma.events.findMany({
        where: {
          OR: [
            { start_date: { gte: now } },
            { recurrence_start_date: { gte: now } },
          ],
          status: { in: [EVENT_STATUS.PUBLISHED, EVENT_STATUS.ONLINE] },
        },
        include: {
          organizer_user: true,
          organizer_division: true,
          organizer_club: true,
        },
        orderBy: { start_date: "asc" },
      });

      return events.map((event) => this.mapToEventEntity(event));
    } catch (error) {
      throw new AppException(
        `Error finding upcoming events: ${(error as Error).message}`,
        500
      );
    }
  }

  async findEventsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Event[]> {
    try {
      const events = await this.prisma.events.findMany({
        where: {
          OR: [
            {
              AND: [
                { start_date: { gte: startDate } },
                { start_date: { lte: endDate } },
              ],
            },
            {
              AND: [
                { recurrence_start_date: { gte: startDate } },
                { recurrence_start_date: { lte: endDate } },
              ],
            },
          ],
        },
        include: {
          organizer_user: true,
          organizer_division: true,
          organizer_club: true,
        },
        orderBy: { start_date: "asc" },
      });

      return events.map((event) => this.mapToEventEntity(event));
    } catch (error) {
      throw new AppException(
        `Error finding events by date range: ${(error as Error).message}`,
        500
      );
    }
  }

  async findConflictingEvents(
    startDate: Date,
    _endDate: Date,
    startTime: string,
    endTime: string,
    excludeEventId?: string
  ): Promise<Event[]> {
    try {
      const whereClause: any = {
        start_date: startDate,
        OR: [
          {
            AND: [
              { start_time: { lt: endTime } },
              { end_time: { gt: startTime } },
            ],
          },
        ],
      };

      if (excludeEventId) {
        whereClause.id = { not: excludeEventId };
      }

      const events = await this.prisma.events.findMany({
        where: whereClause,
        include: {
          organizer_user: true,
          organizer_division: true,
          organizer_club: true,
        },
      });

      return events.map((event) => this.mapToEventEntity(event));
    } catch (error) {
      throw new AppException(
        `Error finding conflicting events: ${(error as Error).message}`,
        500
      );
    }
  }

  // Event Sessions
  async createEventSession(
    session: Partial<EventSession>
  ): Promise<EventSession> {
    try {
      const createdSession = await this.prisma.event_sessions.create({
        data: {
          event_id: session.eventId!,
          session_date: session.sessionDate!,
          start_time: session.startTime!,
          end_time: session.endTime!,
          is_cancelled: session.isCancelled || false,
          cancellation_reason: session.cancellationReason || null,
        },
      });

      return this.mapToEventSessionEntity(createdSession);
    } catch (error) {
      throw new AppException(
        `Error creating event session: ${(error as Error).message}`,
        500
      );
    }
  }

  async findEventSessions(eventId: string): Promise<EventSession[]> {
    try {
      const sessions = await this.prisma.event_sessions.findMany({
        where: { event_id: eventId },
        orderBy: { session_date: "asc" },
      });

      return sessions.map((session) => this.mapToEventSessionEntity(session));
    } catch (error) {
      throw new AppException(
        `Error finding event sessions: ${(error as Error).message}`,
        500
      );
    }
  }

  async updateEventSession(
    id: string,
    session: Partial<EventSession>
  ): Promise<EventSession> {
    try {
      const sessionData = this.filterUndefined({
        session_date: session.sessionDate,
        start_time: session.startTime,
        end_time: session.endTime,
        is_cancelled: session.isCancelled,
        cancellation_reason: session.cancellationReason,
      });

      const updatedSession = await this.prisma.event_sessions.update({
        where: { id },
        data: sessionData,
      });

      return this.mapToEventSessionEntity(updatedSession);
    } catch (error) {
      throw new AppException(
        `Error updating event session: ${(error as Error).message}`,
        500
      );
    }
  }

  async deleteEventSession(id: string): Promise<void> {
    try {
      await this.prisma.event_sessions.delete({
        where: { id },
      });
    } catch (error) {
      throw new AppException(
        `Error deleting event session: ${(error as Error).message}`,
        500
      );
    }
  }

  // Event Attendees
  async createEventAttendee(
    attendee: Partial<EventAttendee>
  ): Promise<EventAttendee> {
    try {
      const createdAttendee = await this.prisma.event_attendees.create({
        data: {
          user_id: attendee.userId!,
          event_id: attendee.eventId!,
          status: attendee.status || ATTENDEE_STATUS.REGISTERED,
        },
      });

      return this.mapToEventAttendeeEntity(createdAttendee);
    } catch (error) {
      throw new AppException(
        `Error creating event attendee: ${(error as Error).message}`,
        500
      );
    }
  }

  async findEventAttendees(eventId: string): Promise<EventAttendee[]> {
    try {
      const attendees = await this.prisma.event_attendees.findMany({
        where: { event_id: eventId },
        orderBy: { created_at: "desc" },
      });

      return attendees.map((attendee) =>
        this.mapToEventAttendeeEntity(attendee)
      );
    } catch (error) {
      throw new AppException(
        `Error finding event attendees: ${(error as Error).message}`,
        500
      );
    }
  }

  async findUserEventAttendance(
    userId: string,
    eventId: string
  ): Promise<EventAttendee | null> {
    try {
      const attendee = await this.prisma.event_attendees.findUnique({
        where: {
          user_id_event_id: {
            user_id: userId,
            event_id: eventId,
          },
        },
      });

      if (!attendee) return null;

      return this.mapToEventAttendeeEntity(attendee);
    } catch (error) {
      throw new AppException(
        `Error finding user event attendance: ${(error as Error).message}`,
        500
      );
    }
  }

  async updateEventAttendee(
    id: string,
    attendee: Partial<EventAttendee>
  ): Promise<EventAttendee> {
    try {
      const attendeeData = this.filterUndefined({
        status: attendee.status,
      });

      const updatedAttendee = await this.prisma.event_attendees.update({
        where: { id },
        data: attendeeData,
      });

      return this.mapToEventAttendeeEntity(updatedAttendee);
    } catch (error) {
      throw new AppException(
        `Error updating event attendee: ${(error as Error).message}`,
        500
      );
    }
  }

  async deleteEventAttendee(id: string): Promise<void> {
    try {
      await this.prisma.event_attendees.delete({
        where: { id },
      });
    } catch (error) {
      throw new AppException(
        `Error deleting event attendee: ${(error as Error).message}`,
        500
      );
    }
  }

  async findUserEventAttendances(userId: string): Promise<EventAttendee[]> {
    try {
      const attendees = await this.prisma.event_attendees.findMany({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
      });

      return attendees.map((attendee) =>
        this.mapToEventAttendeeEntity(attendee)
      );
    } catch (error) {
      throw new AppException(
        `Error finding user event attendances: ${(error as Error).message}`,
        500
      );
    }
  }

  async countEventAttendees(eventId: string): Promise<number> {
    try {
      return await this.prisma.event_attendees.count({
        where: {
          event_id: eventId,
          status: ATTENDEE_STATUS.REGISTERED,
        },
      });
    } catch (error) {
      throw new AppException(
        `Error counting event attendees: ${(error as Error).message}`,
        500
      );
    }
  }

  async findEventsWithAvailableSlots(): Promise<Event[]> {
    try {
      const events = await this.prisma.events.findMany({
        where: {
          status: { in: [EVENT_STATUS.PUBLISHED, EVENT_STATUS.ONLINE] },
          OR: [
            { max_participants: null },
            {
              AND: [
                { max_participants: { not: null } },
                {
                  attendees: {
                    some: {
                      status: ATTENDEE_STATUS.REGISTERED,
                    },
                  },
                },
              ],
            },
          ],
        },
        include: {
          organizer_user: true,
          organizer_division: true,
          organizer_club: true,
          _count: {
            select: {
              attendees: {
                where: { status: "REGISTERED" },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
      });

      return events
        .filter((event) => {
          if (!event.max_participants) return true;
          return event._count.attendees < event.max_participants;
        })
        .map((event) => this.mapToEventEntity(event));
    } catch (error) {
      throw new AppException(
        `Error finding events with available slots: ${
          (error as Error).message
        }`,
        500
      );
    }
  }

  // Mapping methods
  private mapToEventEntity(event: any): Event {
    return {
      id: event.id,
      name: event.name,
      description: event.description,
      status: event.status,
      eventType: event.event_type,
      startDate: event.start_date,
      endDate: event.end_date,
      isRecurring: event.is_recurring,
      recurrencePattern: event.recurrence_pattern,
      recurrenceInterval: event.recurrence_interval,
      recurrenceStartDate: event.recurrence_start_date,
      recurrenceEndDate: event.recurrence_end_date,
      recurrenceDays: event.recurrence_days,
      sessionDurationMinutes: event.session_duration_minutes,
      startTime: event.start_time,
      endTime: event.end_time,
      coverUrl: event.cover_url,
      location: event.location,
      isPublic: event.is_public,
      maxParticipants: event.max_participants,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
      organizerType: event.organizer_type,
      organizerUserId: event.organizer_user_id,
      organizerDivisionId: event.organizer_division_id,
      organizerClubId: event.organizer_club_id,
      externalOrganizerName: event.external_organizer_name,
      userId: event.user_id,
    };
  }

  private mapToEventSessionEntity(session: any): EventSession {
    return {
      id: session.id,
      eventId: session.event_id,
      sessionDate: session.session_date,
      startTime: session.start_time,
      endTime: session.end_time,
      isCancelled: session.is_cancelled,
      cancellationReason: session.cancellation_reason,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    };
  }

  // Paginated query operations
  async findByUserIdWithPagination(
    userId: string,
    skip: number,
    limit: number
  ): Promise<{ events: Event[]; total: number }> {
    try {
      const [events, total] = await Promise.all([
        this.prisma.events.findMany({
          where: { user_id: userId },
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        this.prisma.events.count({
          where: { user_id: userId },
        }),
      ]);

      return {
        events: events.map((event) => this.mapToEventEntity(event)),
        total,
      };
    } catch (error) {
      throw new AppException(
        `Error finding events by user with pagination: ${
          (error as Error).message
        }`,
        500
      );
    }
  }

  async findByStatusWithPagination(
    status: string,
    skip: number,
    limit: number
  ): Promise<{ events: Event[]; total: number }> {
    try {
      const [events, total] = await Promise.all([
        this.prisma.events.findMany({
          where: { status: status as any },
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        this.prisma.events.count({
          where: { status: status as any },
        }),
      ]);

      return {
        events: events.map((event) => this.mapToEventEntity(event)),
        total,
      };
    } catch (error) {
      throw new AppException(
        `Error finding events by status with pagination: ${
          (error as Error).message
        }`,
        500
      );
    }
  }

  async findByEventTypeWithPagination(
    eventType: string,
    skip: number,
    limit: number
  ): Promise<{ events: Event[]; total: number }> {
    try {
      const [events, total] = await Promise.all([
        this.prisma.events.findMany({
          where: { event_type: eventType as any },
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        this.prisma.events.count({
          where: { event_type: eventType as any },
        }),
      ]);

      return {
        events: events.map((event) => this.mapToEventEntity(event)),
        total,
      };
    } catch (error) {
      throw new AppException(
        `Error finding events by type with pagination: ${
          (error as Error).message
        }`,
        500
      );
    }
  }

  async findByOrganizerWithPagination(
    organizerType: string,
    organizerId: string,
    skip: number,
    limit: number
  ): Promise<{ events: Event[]; total: number }> {
    try {
      const whereClause: any = { organizer_type: organizerType as any };

      if (organizerType === ORGANIZER_TYPE.USER) {
        whereClause.organizer_user_id = organizerId;
      } else if (organizerType === ORGANIZER_TYPE.DIVISION) {
        whereClause.organizer_division_id = organizerId;
      } else if (organizerType === ORGANIZER_TYPE.CLUB) {
        whereClause.organizer_club_id = organizerId;
      }

      const [events, total] = await Promise.all([
        this.prisma.events.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        this.prisma.events.count({
          where: whereClause,
        }),
      ]);

      return {
        events: events.map((event) => this.mapToEventEntity(event)),
        total,
      };
    } catch (error) {
      throw new AppException(
        `Error finding events by organizer with pagination: ${
          (error as Error).message
        }`,
        500
      );
    }
  }

  async findPublicEventsWithPagination(
    skip: number,
    limit: number
  ): Promise<{ events: Event[]; total: number }> {
    try {
      const [events, total] = await Promise.all([
        this.prisma.events.findMany({
          where: { is_public: true },
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        this.prisma.events.count({
          where: { is_public: true },
        }),
      ]);

      return {
        events: events.map((event) => this.mapToEventEntity(event)),
        total,
      };
    } catch (error) {
      throw new AppException(
        `Error finding public events with pagination: ${
          (error as Error).message
        }`,
        500
      );
    }
  }

  async findUpcomingEventsWithPagination(
    skip: number,
    limit: number
  ): Promise<{ events: Event[]; total: number }> {
    try {
      const now = new Date();
      const [events, total] = await Promise.all([
        this.prisma.events.findMany({
          where: {
            start_date: {
              gte: now,
            },
          },
          skip,
          take: limit,
          orderBy: { start_date: "asc" },
        }),
        this.prisma.events.count({
          where: {
            start_date: {
              gte: now,
            },
          },
        }),
      ]);

      return {
        events: events.map((event) => this.mapToEventEntity(event)),
        total,
      };
    } catch (error) {
      throw new AppException(
        `Error finding upcoming events with pagination: ${
          (error as Error).message
        }`,
        500
      );
    }
  }

  async findEventsByDateRangeWithPagination(
    startDate: Date,
    endDate: Date,
    skip: number,
    limit: number
  ): Promise<{ events: Event[]; total: number }> {
    try {
      const [events, total] = await Promise.all([
        this.prisma.events.findMany({
          where: {
            start_date: {
              gte: startDate,
              lte: endDate,
            },
          },
          skip,
          take: limit,
          orderBy: { start_date: "asc" },
        }),
        this.prisma.events.count({
          where: {
            start_date: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
      ]);

      return {
        events: events.map((event) => this.mapToEventEntity(event)),
        total,
      };
    } catch (error) {
      throw new AppException(
        `Error finding events by date range with pagination: ${
          (error as Error).message
        }`,
        500
      );
    }
  }

  async findAllWithPagination(
    skip: number,
    limit: number
  ): Promise<{ events: Event[]; total: number }> {
    try {
      const [events, total] = await Promise.all([
        this.prisma.events.findMany({
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        this.prisma.events.count(),
      ]);

      return {
        events: events.map((event) => this.mapToEventEntity(event)),
        total,
      };
    } catch (error) {
      throw new AppException(
        `Error finding all events with pagination: ${(error as Error).message}`,
        500
      );
    }
  }

  private mapToEventAttendeeEntity(attendee: any): EventAttendee {
    return {
      id: attendee.id,
      userId: attendee.user_id,
      eventId: attendee.event_id,
      status: attendee.status,
      createdAt: attendee.created_at,
      updatedAt: attendee.updated_at,
    };
  }
}
