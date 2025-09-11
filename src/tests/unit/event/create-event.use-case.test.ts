import {
  CreateEventUseCase,
  CreateEventInput,
} from "@/application/use-cases/event/create-event.use-case";
import { IEventRepository } from "@/domain/repositories/event.repository";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { IRoleRepository } from "@/domain/repositories/role.repository";
import { EventValidationService } from "@/application/services/event/event-validation.service";
import { EventBusinessService } from "@/application/services/event/event-business.service";
import { RoleValidationService } from "@/application/services/auth/role-validation.service";
import { Event } from "@/domain/entities/event.entity";
import AppException from "@/shared/utils/exception.util";

// Mock dependencies
jest.mock("@/application/services/event/event-validation.service");
jest.mock("@/application/services/event/event-business.service");
jest.mock("@/application/services/auth/role-validation.service");

describe("CreateEventUseCase", () => {
  let createEventUseCase: CreateEventUseCase;
  let mockEventRepository: jest.Mocked<IEventRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockRoleRepository: jest.Mocked<IRoleRepository>;
  let mockEventValidationService: jest.Mocked<EventValidationService>;
  let mockEventBusinessService: jest.Mocked<EventBusinessService>;
  let mockRoleValidationService: jest.Mocked<RoleValidationService>;

  const mockCreateEventInput: CreateEventInput = {
    name: "Test Event",
    description: "Test event description",
    eventType: "SINGLE",
    startDate: new Date("2025-12-25"),
    endDate: new Date("2025-12-25"),
    startTime: "09:00",
    endTime: "17:00",
    sessionDurationMinutes: 480,
    location: "Test Location",
    isPublic: true,
    maxParticipants: 50,
    organizerType: "USER",
    organizerUserId: "user-123",
    userId: "user-123",
  };

  const mockCreatedEvent: Event = {
    id: "event-123",
    name: "Test Event",
    description: "Test event description",
    status: "DRAFT",
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
    // Create mocks
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

    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByGoogleId: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByVerificationCode: jest.fn(),
      findByResetPasswordCode: jest.fn(),
      assignRole: jest.fn(),
      clearResetPasswordFields: jest.fn(),
      clearVerificationFields: jest.fn(),
      getUserRoleId: jest.fn(),
    };

    mockRoleRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findDefault: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Mock services
    mockEventValidationService = {
      validateEventData: jest.fn(),
      validateNoConflicts: jest.fn(),
    } as any;

    mockEventBusinessService = {
      generateEventSessions: jest.fn(),
    } as any;

    mockRoleValidationService = {
      validateEventCreationPermission: jest.fn(),
      validateEventUpdatePermission: jest.fn(),
      validateEventDeletionPermission: jest.fn(),
    } as any;

    // Create use case instance
    createEventUseCase = new CreateEventUseCase(
      mockEventRepository,
      mockUserRepository,
      mockRoleRepository
    );

    // Replace services with mocks
    (createEventUseCase as any).eventValidationService =
      mockEventValidationService;
    (createEventUseCase as any).eventBusinessService = mockEventBusinessService;
    (createEventUseCase as any).roleValidationService =
      mockRoleValidationService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should create an event successfully", async () => {
      // Arrange
      mockRoleValidationService.validateEventCreationPermission.mockResolvedValue(
        undefined
      );
      mockEventValidationService.validateEventData.mockReturnValue(undefined);
      mockEventValidationService.validateNoConflicts.mockResolvedValue(
        undefined
      );
      mockEventRepository.create.mockResolvedValue(mockCreatedEvent);
      mockEventBusinessService.generateEventSessions.mockResolvedValue([]);

      // Act
      const result = await createEventUseCase.execute(mockCreateEventInput);

      // Assert
      expect(
        mockRoleValidationService.validateEventCreationPermission
      ).toHaveBeenCalledWith("user-123");
      expect(mockEventValidationService.validateEventData).toHaveBeenCalledWith(
        mockCreateEventInput
      );
      expect(
        mockEventValidationService.validateNoConflicts
      ).toHaveBeenCalledWith(mockCreateEventInput);
      expect(mockEventRepository.create).toHaveBeenCalledWith({
        name: "Test Event",
        description: "Test event description",
        status: "DRAFT",
        eventType: "SINGLE",
        startDate: new Date("2025-12-25"),
        endDate: new Date("2025-12-25"),
        startTime: "09:00",
        endTime: "17:00",
        sessionDurationMinutes: 480,
        location: "Test Location",
        isPublic: true,
        maxParticipants: 50,
        organizerType: "USER",
        organizerUserId: "user-123",
        userId: "user-123",
      });
      expect(
        mockEventBusinessService.generateEventSessions
      ).toHaveBeenCalledWith(mockCreatedEvent);
      expect(result).toEqual({
        event: mockCreatedEvent,
        message: "Event created successfully",
      });
    });

    it("should throw AppException when user lacks permission to create events", async () => {
      // Arrange
      const permissionError = new AppException(
        "Role 'member' does not have permission to create events",
        403
      );
      mockRoleValidationService.validateEventCreationPermission.mockRejectedValue(
        permissionError
      );

      // Act & Assert
      await expect(
        createEventUseCase.execute(mockCreateEventInput)
      ).rejects.toThrow(permissionError);
      expect(
        mockEventValidationService.validateEventData
      ).not.toHaveBeenCalled();
      expect(mockEventRepository.create).not.toHaveBeenCalled();
    });

    it("should throw AppException when event data validation fails", async () => {
      // Arrange
      const validationError = new AppException("Invalid event data", 400);
      mockRoleValidationService.validateEventCreationPermission.mockResolvedValue(
        undefined
      );
      mockEventValidationService.validateEventData.mockImplementation(() => {
        throw validationError;
      });

      // Act & Assert
      await expect(
        createEventUseCase.execute(mockCreateEventInput)
      ).rejects.toThrow(validationError);
      expect(
        mockEventValidationService.validateNoConflicts
      ).not.toHaveBeenCalled();
      expect(mockEventRepository.create).not.toHaveBeenCalled();
    });

    it("should throw AppException when there are schedule conflicts", async () => {
      // Arrange
      const conflictError = new AppException(
        "Event conflicts with existing events",
        400
      );
      mockRoleValidationService.validateEventCreationPermission.mockResolvedValue(
        undefined
      );
      mockEventValidationService.validateEventData.mockReturnValue(undefined);
      mockEventValidationService.validateNoConflicts.mockRejectedValue(
        conflictError
      );

      // Act & Assert
      await expect(
        createEventUseCase.execute(mockCreateEventInput)
      ).rejects.toThrow(conflictError);
      expect(mockEventRepository.create).not.toHaveBeenCalled();
    });

    it("should throw AppException when event creation fails", async () => {
      // Arrange
      const createError = new AppException("Database error", 500);
      mockRoleValidationService.validateEventCreationPermission.mockResolvedValue(
        undefined
      );
      mockEventValidationService.validateEventData.mockReturnValue(undefined);
      mockEventValidationService.validateNoConflicts.mockResolvedValue(
        undefined
      );
      mockEventRepository.create.mockRejectedValue(createError);

      // Act & Assert
      await expect(
        createEventUseCase.execute(mockCreateEventInput)
      ).rejects.toThrow(createError);
    });

    it("should throw AppException when session generation fails", async () => {
      // Arrange
      const sessionError = new AppException("Session generation failed", 500);
      mockRoleValidationService.validateEventCreationPermission.mockResolvedValue(
        undefined
      );
      mockEventValidationService.validateEventData.mockReturnValue(undefined);
      mockEventValidationService.validateNoConflicts.mockResolvedValue(
        undefined
      );
      mockEventRepository.create.mockResolvedValue(mockCreatedEvent);
      mockEventBusinessService.generateEventSessions.mockRejectedValue(
        sessionError
      );

      // Act & Assert
      await expect(
        createEventUseCase.execute(mockCreateEventInput)
      ).rejects.toThrow(sessionError);
    });

    it("should handle unexpected errors", async () => {
      // Arrange
      const unexpectedError = new Error("Unexpected error");
      mockRoleValidationService.validateEventCreationPermission.mockRejectedValue(
        unexpectedError
      );

      // Act & Assert
      await expect(
        createEventUseCase.execute(mockCreateEventInput)
      ).rejects.toThrow(
        new AppException("Error creating event: Unexpected error", 500)
      );
    });

    it("should create recurring event successfully", async () => {
      // Arrange
      const recurringEventInput: CreateEventInput = {
        ...mockCreateEventInput,
        eventType: "RECURRING",
        isRecurring: true,
        recurrencePattern: "WEEKLY",
        recurrenceInterval: 2,
        recurrenceStartDate: new Date("2025-12-25"),
        recurrenceEndDate: new Date("2026-01-15"),
        recurrenceDays: "1,3,5", // Monday, Wednesday, Friday
      };

      const recurringEvent: Event = {
        ...mockCreatedEvent,
        eventType: "RECURRING",
        isRecurring: true,
        recurrencePattern: "WEEKLY",
        recurrenceInterval: 2,
        recurrenceStartDate: new Date("2025-12-25"),
        recurrenceEndDate: new Date("2026-01-15"),
        recurrenceDays: "1,3,5",
      };

      mockRoleValidationService.validateEventCreationPermission.mockResolvedValue(
        undefined
      );
      mockEventValidationService.validateEventData.mockReturnValue(undefined);
      mockEventValidationService.validateNoConflicts.mockResolvedValue(
        undefined
      );
      mockEventRepository.create.mockResolvedValue(recurringEvent);
      mockEventBusinessService.generateEventSessions.mockResolvedValue([]);

      // Act
      const result = await createEventUseCase.execute(recurringEventInput);

      // Assert
      expect(result.event.isRecurring).toBe(true);
      expect(result.event.recurrencePattern).toBe("WEEKLY");
      expect(
        mockEventBusinessService.generateEventSessions
      ).toHaveBeenCalledWith(recurringEvent);
    });
  });
});
