import {
  GetEventUseCase,
  GetEventInput,
} from "@/application/use-cases/event/get-event.use-case";
import { IEventRepository } from "@/domain/repositories/event.repository";
import { Event } from "@/domain/entities/event.entity";
import AppException from "@/shared/utils/exception.util";

describe("GetEventUseCase", () => {
  let getEventUseCase: GetEventUseCase;
  let mockEventRepository: jest.Mocked<IEventRepository>;

  const mockEvent: Event = {
    id: "event-123",
    name: "Test Event",
    description: "Test event description",
    status: "PUBLISHED",
    eventType: "SINGLE",
    startDate: new Date("2025-12-25"),
    endDate: new Date("2025-12-25"),
    isRecurring: false,
    sessionDurationMinutes: 480,
    startTime: "09:00",
    endTime: "17:00",
    location: "Test Location",
    isPublic: true,
    maxParticipants: 50,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    organizerType: "USER",
    organizerUserId: "user-123",
    userId: "user-123",
  };

  beforeEach(() => {
    // Create mock repository
    mockEventRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByUserId: jest.fn(),
      findByStatus: jest.fn(),
      findByEventType: jest.fn(),
      findByOrganizer: jest.fn(),
      findPublicEvents: jest.fn(),
      findUpcomingEvents: jest.fn(),
      findEventsByDateRange: jest.fn(),
      findByUserIdWithPagination: jest.fn(),
      findByStatusWithPagination: jest.fn(),
      findByEventTypeWithPagination: jest.fn(),
      findByOrganizerWithPagination: jest.fn(),
      findPublicEventsWithPagination: jest.fn(),
      findUpcomingEventsWithPagination: jest.fn(),
      findEventsByDateRangeWithPagination: jest.fn(),
      findAllWithPagination: jest.fn(),
      findConflictingEvents: jest.fn(),
      createEventSession: jest.fn(),
      findEventSessions: jest.fn(),
      updateEventSession: jest.fn(),
      deleteEventSession: jest.fn(),
      createEventAttendee: jest.fn(),
      findEventAttendees: jest.fn(),
      findUserEventAttendance: jest.fn(),
      updateEventAttendee: jest.fn(),
      deleteEventAttendee: jest.fn(),
      findUserEventAttendances: jest.fn(),
      countEventAttendees: jest.fn(),
      findEventsWithAvailableSlots: jest.fn(),
    };

    // Create use case instance
    getEventUseCase = new GetEventUseCase(mockEventRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should get an event successfully", async () => {
      // Arrange
      const input: GetEventInput = {
        eventId: "event-123",
      };

      mockEventRepository.findById.mockResolvedValue(mockEvent);

      // Act
      const result = await getEventUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith("event-123");
      expect(result).toEqual({
        event: mockEvent,
      });
    });

    it("should throw AppException when event is not found", async () => {
      // Arrange
      const input: GetEventInput = {
        eventId: "non-existent-event",
      };

      mockEventRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(getEventUseCase.execute(input)).rejects.toThrow(
        new AppException("Event not found", 404)
      );
    });

    it("should throw AppException when repository fails", async () => {
      // Arrange
      const input: GetEventInput = {
        eventId: "event-123",
      };

      const repositoryError = new Error("Database connection failed");
      mockEventRepository.findById.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(getEventUseCase.execute(input)).rejects.toThrow(
        new AppException("Error getting event: Database connection failed", 500)
      );
    });

    it("should handle unexpected errors", async () => {
      // Arrange
      const input: GetEventInput = {
        eventId: "event-123",
      };

      const unexpectedError = new Error("Unexpected error");
      mockEventRepository.findById.mockRejectedValue(unexpectedError);

      // Act & Assert
      await expect(getEventUseCase.execute(input)).rejects.toThrow(
        new AppException("Error getting event: Unexpected error", 500)
      );
    });

    it("should get a recurring event successfully", async () => {
      // Arrange
      const recurringEvent: Event = {
        ...mockEvent,
        eventType: "RECURRING",
        isRecurring: true,
        recurrencePattern: "WEEKLY",
        recurrenceInterval: 2,
        recurrenceStartDate: new Date("2025-12-25"),
        recurrenceEndDate: new Date("2026-01-15"),
        recurrenceDays: "1,3,5", // Monday, Wednesday, Friday
      };

      const input: GetEventInput = {
        eventId: "recurring-event-123",
      };

      mockEventRepository.findById.mockResolvedValue(recurringEvent);

      // Act
      const result = await getEventUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(
        "recurring-event-123"
      );
      expect(result.event.isRecurring).toBe(true);
      expect(result.event.recurrencePattern).toBe("WEEKLY");
      expect(result.event.recurrenceInterval).toBe(2);
    });

    it("should get a workshop event successfully", async () => {
      // Arrange
      const workshopEvent: Event = {
        ...mockEvent,
        eventType: "WORKSHOP",
        name: "React Workshop",
        description: "Learn React fundamentals",
        sessionDurationMinutes: 240,
        startTime: "10:00",
        endTime: "14:00",
      };

      const input: GetEventInput = {
        eventId: "workshop-event-123",
      };

      mockEventRepository.findById.mockResolvedValue(workshopEvent);

      // Act
      const result = await getEventUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(
        "workshop-event-123"
      );
      expect(result.event.eventType).toBe("WORKSHOP");
      expect(result.event.name).toBe("React Workshop");
    });

    it("should get a course event successfully", async () => {
      // Arrange
      const courseEvent: Event = {
        ...mockEvent,
        eventType: "COURSE",
        name: "JavaScript Course",
        description: "Complete JavaScript course",
        startDate: new Date("2025-12-25"),
        endDate: new Date("2026-01-15"),
        sessionDurationMinutes: 120,
        startTime: "09:00",
        endTime: "11:00",
      };

      const input: GetEventInput = {
        eventId: "course-event-123",
      };

      mockEventRepository.findById.mockResolvedValue(courseEvent);

      // Act
      const result = await getEventUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(
        "course-event-123"
      );
      expect(result.event.eventType).toBe("COURSE");
      expect(result.event.name).toBe("JavaScript Course");
    });

    it("should get an event with external organizer", async () => {
      // Arrange
      const externalEvent: Event = {
        ...mockEvent,
        organizerType: "EXTERNAL",
        externalOrganizerName: "Tech Conference Inc.",
      };
      delete (externalEvent as any).organizerUserId;

      const input: GetEventInput = {
        eventId: "external-event-123",
      };

      mockEventRepository.findById.mockResolvedValue(externalEvent);

      // Act
      const result = await getEventUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(
        "external-event-123"
      );
      expect(result.event.organizerType).toBe("EXTERNAL");
      expect(result.event.externalOrganizerName).toBe("Tech Conference Inc.");
      expect(result.event.organizerUserId).toBeUndefined();
    });

    it("should get an event with division organizer", async () => {
      // Arrange
      const divisionEvent: Event = {
        ...mockEvent,
        organizerType: "DIVISION",
        organizerDivisionId: "division-123",
      };
      delete (divisionEvent as any).organizerUserId;

      const input: GetEventInput = {
        eventId: "division-event-123",
      };

      mockEventRepository.findById.mockResolvedValue(divisionEvent);

      // Act
      const result = await getEventUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(
        "division-event-123"
      );
      expect(result.event.organizerType).toBe("DIVISION");
      expect(result.event.organizerDivisionId).toBe("division-123");
      expect(result.event.organizerUserId).toBeUndefined();
    });

    it("should get an event with club organizer", async () => {
      // Arrange
      const clubEvent: Event = {
        ...mockEvent,
        organizerType: "CLUB",
        organizerClubId: "club-123",
      };
      delete (clubEvent as any).organizerUserId;

      const input: GetEventInput = {
        eventId: "club-event-123",
      };

      mockEventRepository.findById.mockResolvedValue(clubEvent);

      // Act
      const result = await getEventUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(
        "club-event-123"
      );
      expect(result.event.organizerType).toBe("CLUB");
      expect(result.event.organizerClubId).toBe("club-123");
      expect(result.event.organizerUserId).toBeUndefined();
    });
  });
});
