import {
  RegisterForEventUseCase,
  RegisterForEventInput,
} from "@/application/use-cases/event/register-for-event.use-case";
import { IEventRepository } from "@/domain/repositories/event.repository";
import { Event } from "@/domain/entities/event.entity";
import { EventAttendee } from "@/domain/entities/event.entity";
import AppException from "@/shared/utils/exception.util";

describe("RegisterForEventUseCase", () => {
  let registerForEventUseCase: RegisterForEventUseCase;
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

  const mockEventAttendee: EventAttendee = {
    id: "attendee-123",
    userId: "user-456",
    eventId: "event-123",
    status: "REGISTERED",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
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
    registerForEventUseCase = new RegisterForEventUseCase(mockEventRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should register user for event successfully", async () => {
      // Arrange
      const input: RegisterForEventInput = {
        eventId: "event-123",
        userId: "user-456",
      };

      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockEventRepository.findUserEventAttendance.mockResolvedValue(null);
      mockEventRepository.countEventAttendees.mockResolvedValue(10);
      mockEventRepository.createEventAttendee.mockResolvedValue(
        mockEventAttendee
      );

      // Act
      const result = await registerForEventUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith("event-123");
      expect(mockEventRepository.findUserEventAttendance).toHaveBeenCalledWith(
        "user-456",
        "event-123"
      );
      expect(mockEventRepository.countEventAttendees).toHaveBeenCalledWith(
        "event-123"
      );
      expect(mockEventRepository.createEventAttendee).toHaveBeenCalledWith({
        userId: "user-456",
        eventId: "event-123",
        status: "REGISTERED",
      });
      expect(result).toEqual({
        attendance: mockEventAttendee,
        message: "Successfully registered for event",
      });
    });

    it("should throw AppException when event is not found", async () => {
      // Arrange
      const input: RegisterForEventInput = {
        eventId: "non-existent-event",
        userId: "user-456",
      };

      mockEventRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(registerForEventUseCase.execute(input)).rejects.toThrow(
        new AppException("Event not found", 404)
      );
      expect(mockEventRepository.createEventAttendee).not.toHaveBeenCalled();
    });

    it("should throw AppException when event is not published", async () => {
      // Arrange
      const draftEvent: Event = {
        ...mockEvent,
        status: "DRAFT",
      };

      const input: RegisterForEventInput = {
        eventId: "event-123",
        userId: "user-456",
      };

      mockEventRepository.findById.mockResolvedValue(draftEvent);

      // Act & Assert
      await expect(registerForEventUseCase.execute(input)).rejects.toThrow(
        new AppException("Event is not available for registration", 400)
      );
      expect(mockEventRepository.createEventAttendee).not.toHaveBeenCalled();
    });

    it("should throw AppException when user is already registered", async () => {
      // Arrange
      const input: RegisterForEventInput = {
        eventId: "event-123",
        userId: "user-456",
      };

      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockEventRepository.findUserEventAttendance.mockResolvedValue(
        mockEventAttendee
      );

      // Act & Assert
      await expect(registerForEventUseCase.execute(input)).rejects.toThrow(
        new AppException("User is already registered for this event", 400)
      );
      expect(mockEventRepository.createEventAttendee).not.toHaveBeenCalled();
    });

    it("should throw AppException when event is at capacity", async () => {
      // Arrange
      const input: RegisterForEventInput = {
        eventId: "event-123",
        userId: "user-456",
      };

      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockEventRepository.findUserEventAttendance.mockResolvedValue(null);
      mockEventRepository.countEventAttendees.mockResolvedValue(50); // At max capacity

      // Act & Assert
      await expect(registerForEventUseCase.execute(input)).rejects.toThrow(
        new AppException("Event has reached maximum participants", 400)
      );
      expect(mockEventRepository.createEventAttendee).not.toHaveBeenCalled();
    });

    it("should register user when event has no capacity limit", async () => {
      // Arrange
      const unlimitedEvent: Event = {
        ...mockEvent,
      };
      delete (unlimitedEvent as any).maxParticipants;

      const input: RegisterForEventInput = {
        eventId: "event-123",
        userId: "user-456",
      };

      mockEventRepository.findById.mockResolvedValue(unlimitedEvent);
      mockEventRepository.findUserEventAttendance.mockResolvedValue(null);
      mockEventRepository.createEventAttendee.mockResolvedValue(
        mockEventAttendee
      );

      // Act
      const result = await registerForEventUseCase.execute(input);

      // Assert
      expect(mockEventRepository.countEventAttendees).not.toHaveBeenCalled();
      expect(mockEventRepository.createEventAttendee).toHaveBeenCalledWith({
        userId: "user-456",
        eventId: "event-123",
        status: "REGISTERED",
      });
      expect(result).toEqual({
        attendance: mockEventAttendee,
        message: "Successfully registered for event",
      });
    });

    it("should register user for recurring event successfully", async () => {
      // Arrange
      const recurringEvent: Event = {
        ...mockEvent,
        eventType: "RECURRING",
        isRecurring: true,
        recurrencePattern: "WEEKLY",
        recurrenceInterval: 2,
        recurrenceStartDate: new Date("2025-12-25"),
        recurrenceEndDate: new Date("2026-01-15"),
        recurrenceDays: "1,3,5",
      };

      const input: RegisterForEventInput = {
        eventId: "recurring-event-123",
        userId: "user-456",
      };

      mockEventRepository.findById.mockResolvedValue(recurringEvent);
      mockEventRepository.findUserEventAttendance.mockResolvedValue(null);
      mockEventRepository.countEventAttendees.mockResolvedValue(10);
      mockEventRepository.createEventAttendee.mockResolvedValue(
        mockEventAttendee
      );

      // Act
      const result = await registerForEventUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(
        "recurring-event-123"
      );
      expect(mockEventRepository.createEventAttendee).toHaveBeenCalledWith({
        userId: "user-456",
        eventId: "recurring-event-123",
        status: "REGISTERED",
      });
      expect(result).toEqual({
        attendance: mockEventAttendee,
        message: "Successfully registered for event",
      });
    });

    it("should throw AppException when repository findById fails", async () => {
      // Arrange
      const input: RegisterForEventInput = {
        eventId: "event-123",
        userId: "user-456",
      };

      const findError = new Error("Database connection failed");
      mockEventRepository.findById.mockRejectedValue(findError);

      // Act & Assert
      await expect(registerForEventUseCase.execute(input)).rejects.toThrow(
        new AppException(
          "Error registering for event: Database connection failed",
          500
        )
      );
    });

    it("should throw AppException when repository createEventAttendee fails", async () => {
      // Arrange
      const input: RegisterForEventInput = {
        eventId: "event-123",
        userId: "user-456",
      };

      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockEventRepository.findUserEventAttendance.mockResolvedValue(null);
      mockEventRepository.countEventAttendees.mockResolvedValue(10);
      const createError = new Error("Database insert failed");
      mockEventRepository.createEventAttendee.mockRejectedValue(createError);

      // Act & Assert
      await expect(registerForEventUseCase.execute(input)).rejects.toThrow(
        new AppException(
          "Error registering for event: Database insert failed",
          500
        )
      );
    });

    it("should handle unexpected errors", async () => {
      // Arrange
      const input: RegisterForEventInput = {
        eventId: "event-123",
        userId: "user-456",
      };

      const unexpectedError = new Error("Unexpected error");
      mockEventRepository.findById.mockRejectedValue(unexpectedError);

      // Act & Assert
      await expect(registerForEventUseCase.execute(input)).rejects.toThrow(
        new AppException("Error registering for event: Unexpected error", 500)
      );
    });

    it("should register user for private event successfully", async () => {
      // Arrange
      const privateEvent: Event = {
        ...mockEvent,
        isPublic: false,
      };

      const input: RegisterForEventInput = {
        eventId: "private-event-123",
        userId: "user-456",
      };

      mockEventRepository.findById.mockResolvedValue(privateEvent);
      mockEventRepository.findUserEventAttendance.mockResolvedValue(null);
      mockEventRepository.countEventAttendees.mockResolvedValue(10);
      mockEventRepository.createEventAttendee.mockResolvedValue(
        mockEventAttendee
      );

      // Act
      const result = await registerForEventUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(
        "private-event-123"
      );
      expect(mockEventRepository.createEventAttendee).toHaveBeenCalledWith({
        userId: "user-456",
        eventId: "private-event-123",
        status: "REGISTERED",
      });
      expect(result).toEqual({
        attendance: mockEventAttendee,
        message: "Successfully registered for event",
      });
    });
  });
});
