import {
  UpdateEventUseCase,
  UpdateEventInput,
} from "@/application/use-cases/event/update-event.use-case";
import { IEventRepository } from "@/domain/repositories/event.repository";
import { Event } from "@/domain/entities/event.entity";
import { EventValidationService } from "@/application/services/event/event-validation.service";
import { EventBusinessService } from "@/application/services/event/event-business.service";
import AppException from "@/shared/utils/exception.util";

// Mock the validation services
jest.mock("@/application/services/event/event-validation.service");
jest.mock("@/application/services/event/event-business.service");

describe("UpdateEventUseCase", () => {
  let updateEventUseCase: UpdateEventUseCase;
  let mockEventRepository: jest.Mocked<IEventRepository>;
  let mockEventValidationService: jest.Mocked<EventValidationService>;
  let mockEventBusinessService: jest.Mocked<EventBusinessService>;

  const mockExistingEvent: Event = {
    id: "event-123",
    name: "Original Event",
    description: "Original description",
    status: "DRAFT",
    eventType: "SINGLE",
    startDate: new Date("2025-12-25"),
    endDate: new Date("2025-12-25"),
    isRecurring: false,
    sessionDurationMinutes: 480,
    startTime: "09:00",
    endTime: "17:00",
    location: "Original Location",
    isPublic: true,
    maxParticipants: 50,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    organizerType: "USER",
    organizerUserId: "user-123",
    userId: "user-123",
  };

  const mockUpdatedEvent: Event = {
    ...mockExistingEvent,
    name: "Updated Event",
    description: "Updated description",
    status: "PUBLISHED",
    location: "Updated Location",
    maxParticipants: 100,
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
      findEventSessions: jest.fn().mockResolvedValue([]),
      updateEventSession: jest.fn(),
      deleteEventSession: jest.fn().mockResolvedValue(undefined),
      createEventAttendee: jest.fn(),
      findEventAttendees: jest.fn(),
      findUserEventAttendance: jest.fn(),
      updateEventAttendee: jest.fn(),
      deleteEventAttendee: jest.fn(),
      findUserEventAttendances: jest.fn(),
      countEventAttendees: jest.fn(),
      findEventsWithAvailableSlots: jest.fn(),
    };

    // Create mock validation services
    mockEventValidationService = {
      validateEventData: jest.fn(),
      validateNoConflicts: jest.fn().mockResolvedValue(undefined),
      validateMaxParticipants: jest.fn().mockResolvedValue(undefined),
      validateUserPermissions: jest.fn(),
      validateEventCanBeUpdated: jest.fn().mockResolvedValue(undefined),
      validateEventNameUnique: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockEventBusinessService = {
      generateEventSessions: jest.fn().mockResolvedValue(undefined),
    } as any;

    // Create use case instance
    updateEventUseCase = new UpdateEventUseCase(mockEventRepository);

    // Replace the validation services with mocks
    (updateEventUseCase as any).eventValidationService =
      mockEventValidationService;
    (updateEventUseCase as any).eventBusinessService = mockEventBusinessService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should update an event successfully", async () => {
      // Arrange
      const input: UpdateEventInput = {
        eventId: "event-123",
        userId: "user-123",
        name: "Updated Event",
        description: "Updated description",
        status: "PUBLISHED",
        location: "Updated Location",
        maxParticipants: 100,
      };

      mockEventRepository.findById.mockResolvedValue(mockExistingEvent);
      mockEventRepository.update.mockResolvedValue(mockUpdatedEvent);

      // Act
      const result = await updateEventUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findById).toHaveBeenCalledWith("event-123");
      expect(mockEventRepository.update).toHaveBeenCalledWith("event-123", {
        name: "Updated Event",
        description: "Updated description",
        status: "PUBLISHED",
        location: "Updated Location",
        maxParticipants: 100,
      });
      expect(result).toEqual({
        event: mockUpdatedEvent,
        message: "Event updated successfully",
      });
    });

    it("should throw AppException when event is not found", async () => {
      // Arrange
      const input: UpdateEventInput = {
        eventId: "non-existent-event",
        userId: "user-123",
        name: "Updated Event",
      };

      mockEventRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(updateEventUseCase.execute(input)).rejects.toThrow(
        new AppException("Event not found", 404)
      );
      expect(mockEventRepository.update).not.toHaveBeenCalled();
    });

    it("should update only provided fields", async () => {
      // Arrange
      const input: UpdateEventInput = {
        eventId: "event-123",
        userId: "user-123",
        name: "Updated Event Name Only",
      };

      const partiallyUpdatedEvent: Event = {
        ...mockExistingEvent,
        name: "Updated Event Name Only",
        updatedAt: new Date("2024-01-02"),
      };

      mockEventRepository.findById.mockResolvedValue(mockExistingEvent);
      mockEventRepository.update.mockResolvedValue(partiallyUpdatedEvent);

      // Act
      const result = await updateEventUseCase.execute(input);

      // Assert
      expect(mockEventRepository.update).toHaveBeenCalledWith("event-123", {
        name: "Updated Event Name Only",
      });
      expect(result.event.name).toBe("Updated Event Name Only");
      expect(result.event.description).toBe("Original description"); // Unchanged
    });

    it("should update event type successfully", async () => {
      // Arrange
      const input: UpdateEventInput = {
        eventId: "event-123",
        userId: "user-123",
        eventType: "WORKSHOP",
        sessionDurationMinutes: 240,
        startTime: "10:00",
        endTime: "14:00",
      };

      const typeUpdatedEvent: Event = {
        ...mockExistingEvent,
        eventType: "WORKSHOP",
        sessionDurationMinutes: 240,
        startTime: "10:00",
        endTime: "14:00",
        updatedAt: new Date("2024-01-02"),
      };

      mockEventRepository.findById.mockResolvedValue(mockExistingEvent);
      mockEventRepository.update.mockResolvedValue(typeUpdatedEvent);

      // Act
      const result = await updateEventUseCase.execute(input);

      // Assert
      expect(mockEventRepository.update).toHaveBeenCalledWith("event-123", {
        eventType: "WORKSHOP",
        sessionDurationMinutes: 240,
        startTime: "10:00",
        endTime: "14:00",
      });
      expect(result.event.eventType).toBe("WORKSHOP");
    });

    it("should update recurring event properties successfully", async () => {
      // Arrange
      const input: UpdateEventInput = {
        eventId: "event-123",
        userId: "user-123",
        eventType: "RECURRING",
        isRecurring: true,
        recurrencePattern: "WEEKLY",
        recurrenceInterval: 2,
        recurrenceStartDate: new Date("2025-12-25"),
        recurrenceEndDate: new Date("2026-01-15"),
        recurrenceDays: "1,3,5",
      };

      const recurringUpdatedEvent: Event = {
        ...mockExistingEvent,
        eventType: "RECURRING",
        isRecurring: true,
        recurrencePattern: "WEEKLY",
        recurrenceInterval: 2,
        recurrenceStartDate: new Date("2025-12-25"),
        recurrenceEndDate: new Date("2026-01-15"),
        recurrenceDays: "1,3,5",
        updatedAt: new Date("2024-01-02"),
      };

      mockEventRepository.findById.mockResolvedValue(mockExistingEvent);
      mockEventRepository.update.mockResolvedValue(recurringUpdatedEvent);

      // Act
      const result = await updateEventUseCase.execute(input);

      // Assert
      expect(mockEventRepository.update).toHaveBeenCalledWith("event-123", {
        eventType: "RECURRING",
        isRecurring: true,
        recurrencePattern: "WEEKLY",
        recurrenceInterval: 2,
        recurrenceStartDate: new Date("2025-12-25"),
        recurrenceEndDate: new Date("2026-01-15"),
        recurrenceDays: "1,3,5",
      });
      expect(result.event.isRecurring).toBe(true);
      expect(result.event.recurrencePattern).toBe("WEEKLY");
    });

    it("should update organizer information successfully", async () => {
      // Arrange
      const input: UpdateEventInput = {
        eventId: "event-123",
        userId: "user-123",
        organizerType: "DIVISION",
        organizerDivisionId: "division-123",
        organizerUserId: null,
        organizerClubId: null,
        externalOrganizerName: null,
      };

      const organizerUpdatedEvent: Event = {
        ...mockExistingEvent,
        organizerType: "DIVISION",
        organizerDivisionId: "division-123",
        updatedAt: new Date("2024-01-02"),
      };
      delete (organizerUpdatedEvent as any).organizerUserId;
      delete (organizerUpdatedEvent as any).organizerClubId;
      delete (organizerUpdatedEvent as any).externalOrganizerName;

      mockEventRepository.findById.mockResolvedValue(mockExistingEvent);
      mockEventRepository.update.mockResolvedValue(organizerUpdatedEvent);

      // Act
      const result = await updateEventUseCase.execute(input);

      // Assert
      expect(mockEventRepository.update).toHaveBeenCalledWith("event-123", {
        organizerType: "DIVISION",
        organizerDivisionId: "division-123",
        organizerUserId: null,
        organizerClubId: null,
        externalOrganizerName: null,
      });
      expect(result.event.organizerType).toBe("DIVISION");
      expect(result.event.organizerDivisionId).toBe("division-123");
    });

    it("should throw AppException when repository update fails", async () => {
      // Arrange
      const input: UpdateEventInput = {
        eventId: "event-123",
        userId: "user-123",
        name: "Updated Event",
      };

      mockEventRepository.findById.mockResolvedValue(mockExistingEvent);
      const updateError = new Error("Database update failed");
      mockEventRepository.update.mockRejectedValue(updateError);

      // Act & Assert
      await expect(updateEventUseCase.execute(input)).rejects.toThrow(
        new AppException("Error updating event: Database update failed", 500)
      );
    });

    it("should throw AppException when repository findById fails", async () => {
      // Arrange
      const input: UpdateEventInput = {
        eventId: "event-123",
        userId: "user-123",
        name: "Updated Event",
      };

      const findError = new Error("Database connection failed");
      mockEventRepository.findById.mockRejectedValue(findError);

      // Act & Assert
      await expect(updateEventUseCase.execute(input)).rejects.toThrow(
        new AppException(
          "Error updating event: Database connection failed",
          500
        )
      );
    });

    it("should handle empty update input", async () => {
      // Arrange
      const input: UpdateEventInput = {
        eventId: "event-123",
        userId: "user-123",
      };

      mockEventRepository.findById.mockResolvedValue(mockExistingEvent);
      mockEventRepository.update.mockResolvedValue(mockExistingEvent);

      // Act
      const result = await updateEventUseCase.execute(input);

      // Assert
      expect(mockEventRepository.update).toHaveBeenCalledWith("event-123", {});
      expect(result.event).toEqual(mockExistingEvent);
    });

    it("should update event dates successfully", async () => {
      // Arrange
      const newStartDate = new Date("2025-12-30");
      const newEndDate = new Date("2025-12-30");
      const input: UpdateEventInput = {
        eventId: "event-123",
        userId: "user-123",
        startDate: newStartDate,
        endDate: newEndDate,
      };

      const dateUpdatedEvent: Event = {
        ...mockExistingEvent,
        startDate: newStartDate,
        endDate: newEndDate,
        updatedAt: new Date("2024-01-02"),
      };

      mockEventRepository.findById.mockResolvedValue(mockExistingEvent);
      mockEventRepository.update.mockResolvedValue(dateUpdatedEvent);

      // Act
      const result = await updateEventUseCase.execute(input);

      // Assert
      expect(mockEventRepository.update).toHaveBeenCalledWith("event-123", {
        startDate: newStartDate,
        endDate: newEndDate,
      });
      expect(result.event.startDate).toEqual(newStartDate);
      expect(result.event.endDate).toEqual(newEndDate);
    });
  });
});
