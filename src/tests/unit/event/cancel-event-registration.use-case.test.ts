import {
  CancelEventRegistrationUseCase,
  CancelEventRegistrationInput,
} from "@/application/use-cases/event/cancel-event-registration.use-case";
import { IEventRepository } from "@/domain/repositories/event.repository";
import { Event } from "@/domain/entities/event.entity";
import { EventAttendee } from "@/domain/entities/event.entity";
import AppException from "@/shared/utils/exception.util";

describe("CancelEventRegistrationUseCase", () => {
  let cancelEventRegistrationUseCase: CancelEventRegistrationUseCase;
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

  const mockCancelledAttendee: EventAttendee = {
    ...mockEventAttendee,
    status: "CANCELLED",
    updatedAt: new Date("2024-01-02"),
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
    cancelEventRegistrationUseCase = new CancelEventRegistrationUseCase(
      mockEventRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should cancel event registration successfully", async () => {
      // Arrange
      const input: CancelEventRegistrationInput = {
        eventId: "event-123",
        userId: "user-456",
      };

      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockEventRepository.findUserEventAttendance.mockResolvedValue(
        mockEventAttendee
      );
      mockEventRepository.updateEventAttendee.mockResolvedValue(
        mockCancelledAttendee
      );

      // Act
      const result = await cancelEventRegistrationUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith("event-123");
      expect(mockEventRepository.findUserEventAttendance).toHaveBeenCalledWith(
        "user-456",
        "event-123"
      );
      expect(mockEventRepository.updateEventAttendee).toHaveBeenCalledWith(
        "attendee-123",
        {
          status: "CANCELLED",
        }
      );
      expect(result).toEqual({
        attendance: mockCancelledAttendee,
        message: "Successfully cancelled event registration",
      });
    });

    it("should throw AppException when event is not found", async () => {
      // Arrange
      const input: CancelEventRegistrationInput = {
        eventId: "non-existent-event",
        userId: "user-456",
      };

      mockEventRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        cancelEventRegistrationUseCase.execute(input)
      ).rejects.toThrow(new AppException("Event not found", 404));
      expect(mockEventRepository.updateEventAttendee).not.toHaveBeenCalled();
    });

    it("should throw AppException when user is not registered for the event", async () => {
      // Arrange
      const input: CancelEventRegistrationInput = {
        eventId: "event-123",
        userId: "user-456",
      };

      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockEventRepository.findUserEventAttendance.mockResolvedValue(null);

      // Act & Assert
      await expect(
        cancelEventRegistrationUseCase.execute(input)
      ).rejects.toThrow(
        new AppException("User is not registered for this event", 400)
      );
      expect(mockEventRepository.updateEventAttendee).not.toHaveBeenCalled();
    });

    it("should throw AppException when user registration is already cancelled", async () => {
      // Arrange
      const input: CancelEventRegistrationInput = {
        eventId: "event-123",
        userId: "user-456",
      };

      const alreadyCancelledAttendee: EventAttendee = {
        ...mockEventAttendee,
        status: "CANCELLED",
      };

      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockEventRepository.findUserEventAttendance.mockResolvedValue(
        alreadyCancelledAttendee
      );

      // Act & Assert
      await expect(
        cancelEventRegistrationUseCase.execute(input)
      ).rejects.toThrow(
        new AppException("User has already cancelled their registration", 400)
      );
      expect(mockEventRepository.updateEventAttendee).not.toHaveBeenCalled();
    });

    it("should cancel registration for recurring event successfully", async () => {
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

      const input: CancelEventRegistrationInput = {
        eventId: "recurring-event-123",
        userId: "user-456",
      };

      mockEventRepository.findById.mockResolvedValue(recurringEvent);
      mockEventRepository.findUserEventAttendance.mockResolvedValue(
        mockEventAttendee
      );
      mockEventRepository.updateEventAttendee.mockResolvedValue(
        mockCancelledAttendee
      );

      // Act
      const result = await cancelEventRegistrationUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(
        "recurring-event-123"
      );
      expect(mockEventRepository.updateEventAttendee).toHaveBeenCalledWith(
        "attendee-123",
        {
          status: "CANCELLED",
        }
      );
      expect(result).toEqual({
        attendance: mockCancelledAttendee,
        message: "Successfully cancelled event registration",
      });
    });

    it("should cancel registration for workshop event successfully", async () => {
      // Arrange
      const workshopEvent: Event = {
        ...mockEvent,
        eventType: "WORKSHOP",
        name: "React Workshop",
        description: "Learn React fundamentals",
      };

      const input: CancelEventRegistrationInput = {
        eventId: "workshop-event-123",
        userId: "user-456",
      };

      mockEventRepository.findById.mockResolvedValue(workshopEvent);
      mockEventRepository.findUserEventAttendance.mockResolvedValue(
        mockEventAttendee
      );
      mockEventRepository.updateEventAttendee.mockResolvedValue(
        mockCancelledAttendee
      );

      // Act
      const result = await cancelEventRegistrationUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(
        "workshop-event-123"
      );
      expect(mockEventRepository.updateEventAttendee).toHaveBeenCalledWith(
        "attendee-123",
        {
          status: "CANCELLED",
        }
      );
      expect(result).toEqual({
        attendance: mockCancelledAttendee,
        message: "Successfully cancelled event registration",
      });
    });

    it("should cancel registration for course event successfully", async () => {
      // Arrange
      const courseEvent: Event = {
        ...mockEvent,
        eventType: "COURSE",
        name: "JavaScript Course",
        description: "Complete JavaScript course",
      };

      const input: CancelEventRegistrationInput = {
        eventId: "course-event-123",
        userId: "user-456",
      };

      mockEventRepository.findById.mockResolvedValue(courseEvent);
      mockEventRepository.findUserEventAttendance.mockResolvedValue(
        mockEventAttendee
      );
      mockEventRepository.updateEventAttendee.mockResolvedValue(
        mockCancelledAttendee
      );

      // Act
      const result = await cancelEventRegistrationUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(
        "course-event-123"
      );
      expect(mockEventRepository.updateEventAttendee).toHaveBeenCalledWith(
        "attendee-123",
        {
          status: "CANCELLED",
        }
      );
      expect(result).toEqual({
        attendance: mockCancelledAttendee,
        message: "Successfully cancelled event registration",
      });
    });

    it("should throw AppException when repository findById fails", async () => {
      // Arrange
      const input: CancelEventRegistrationInput = {
        eventId: "event-123",
        userId: "user-456",
      };

      const findError = new Error("Database connection failed");
      mockEventRepository.findById.mockRejectedValue(findError);
      mockEventRepository.findUserEventAttendance.mockRejectedValue(findError);

      // Act & Assert
      await expect(
        cancelEventRegistrationUseCase.execute(input)
      ).rejects.toThrow(
        new AppException(
          "Error cancelling event registration: Database connection failed",
          500
        )
      );
    });

    it("should throw AppException when repository updateEventAttendee fails", async () => {
      // Arrange
      const input: CancelEventRegistrationInput = {
        eventId: "event-123",
        userId: "user-456",
      };

      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockEventRepository.findUserEventAttendance.mockResolvedValue(
        mockEventAttendee
      );
      const updateError = new Error("Database update failed");
      mockEventRepository.updateEventAttendee.mockRejectedValue(updateError);

      // Act & Assert
      await expect(
        cancelEventRegistrationUseCase.execute(input)
      ).rejects.toThrow(
        new AppException(
          "Error cancelling event registration: Database update failed",
          500
        )
      );
    });

    it("should handle unexpected errors", async () => {
      // Arrange
      const input: CancelEventRegistrationInput = {
        eventId: "event-123",
        userId: "user-456",
      };

      const unexpectedError = new Error("Unexpected error");
      mockEventRepository.findById.mockRejectedValue(unexpectedError);
      mockEventRepository.findUserEventAttendance.mockRejectedValue(unexpectedError);

      // Act & Assert
      await expect(
        cancelEventRegistrationUseCase.execute(input)
      ).rejects.toThrow(
        new AppException(
          "Error cancelling event registration: Unexpected error",
          500
        )
      );
    });

    it("should cancel registration for private event successfully", async () => {
      // Arrange
      const privateEvent: Event = {
        ...mockEvent,
        isPublic: false,
      };

      const input: CancelEventRegistrationInput = {
        eventId: "private-event-123",
        userId: "user-456",
      };

      mockEventRepository.findById.mockResolvedValue(privateEvent);
      mockEventRepository.findUserEventAttendance.mockResolvedValue(
        mockEventAttendee
      );
      mockEventRepository.updateEventAttendee.mockResolvedValue(
        mockCancelledAttendee
      );

      // Act
      const result = await cancelEventRegistrationUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(
        "private-event-123"
      );
      expect(mockEventRepository.updateEventAttendee).toHaveBeenCalledWith(
        "attendee-123",
        {
          status: "CANCELLED",
        }
      );
      expect(result).toEqual({
        attendance: mockCancelledAttendee,
        message: "Successfully cancelled event registration",
      });
    });

    it("should cancel registration for draft event successfully", async () => {
      // Arrange
      const draftEvent: Event = {
        ...mockEvent,
        status: "DRAFT",
      };

      const input: CancelEventRegistrationInput = {
        eventId: "draft-event-123",
        userId: "user-456",
      };

      mockEventRepository.findById.mockResolvedValue(draftEvent);
      mockEventRepository.findUserEventAttendance.mockResolvedValue(
        mockEventAttendee
      );
      mockEventRepository.updateEventAttendee.mockResolvedValue(
        mockCancelledAttendee
      );

      // Act
      const result = await cancelEventRegistrationUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith(
        "draft-event-123"
      );
      expect(mockEventRepository.updateEventAttendee).toHaveBeenCalledWith(
        "attendee-123",
        {
          status: "CANCELLED",
        }
      );
      expect(result).toEqual({
        attendance: mockCancelledAttendee,
        message: "Successfully cancelled event registration",
      });
    });
  });
});
