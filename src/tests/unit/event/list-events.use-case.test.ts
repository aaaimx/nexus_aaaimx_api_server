import {
  ListEventsUseCase,
  ListEventsInput,
} from "@/application/use-cases/event/list-events.use-case";
import { IEventRepository } from "@/domain/repositories/event.repository";
import { Event } from "@/domain/entities/event.entity";
import AppException from "@/shared/utils/exception.util";

describe("ListEventsUseCase", () => {
  let listEventsUseCase: ListEventsUseCase;
  let mockEventRepository: jest.Mocked<IEventRepository>;

  const mockEvents: Event[] = [
    {
      id: "event-1",
      name: "Event 1",
      description: "Description 1",
      status: "PUBLISHED",
      eventType: "SINGLE",
      startDate: new Date("2025-12-25"),
      endDate: new Date("2025-12-25"),
      isRecurring: false,
      sessionDurationMinutes: 480,
      startTime: "09:00",
      endTime: "17:00",
      location: "Location 1",
      isPublic: true,
      maxParticipants: 50,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      organizerType: "USER",
      organizerUserId: "user-1",
      userId: "user-1",
    },
    {
      id: "event-2",
      name: "Event 2",
      description: "Description 2",
      status: "DRAFT",
      eventType: "WORKSHOP",
      startDate: new Date("2025-12-26"),
      endDate: new Date("2025-12-28"),
      isRecurring: false,
      sessionDurationMinutes: 240,
      startTime: "10:00",
      endTime: "14:00",
      location: "Location 2",
      isPublic: false,
      maxParticipants: 20,
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
      organizerType: "USER",
      organizerUserId: "user-2",
      userId: "user-2",
    },
  ];

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
    listEventsUseCase = new ListEventsUseCase(mockEventRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should list all events with pagination", async () => {
      // Arrange
      const input: ListEventsInput = {
        page: 1,
        limit: 10,
      };

      mockEventRepository.findAllWithPagination.mockResolvedValue({
        events: mockEvents,
        total: 2,
      });

      // Act
      const result = await listEventsUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findAllWithPagination).toHaveBeenCalledWith(
        0,
        10
      );
      expect(result).toEqual({
        items: mockEvents,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should list events by user ID with pagination", async () => {
      // Arrange
      const input: ListEventsInput = {
        userId: "user-1",
        page: 1,
        limit: 5,
      };

      const userEvents: Event[] = [mockEvents[0]!];
      mockEventRepository.findByUserIdWithPagination.mockResolvedValue({
        events: userEvents,
        total: 1,
      });

      // Act
      const result = await listEventsUseCase.execute(input);

      // Assert
      expect(
        mockEventRepository.findByUserIdWithPagination
      ).toHaveBeenCalledWith("user-1", 0, 5);
      expect(result).toEqual({
        items: userEvents,
        pagination: {
          total: 1,
          page: 1,
          limit: 5,
          totalPages: 1,
        },
      });
    });

    it("should list events by status with pagination", async () => {
      // Arrange
      const input: ListEventsInput = {
        status: "PUBLISHED",
        page: 1,
        limit: 10,
      };

      const publishedEvents: Event[] = [mockEvents[0]!];
      mockEventRepository.findByStatusWithPagination.mockResolvedValue({
        events: publishedEvents,
        total: 1,
      });

      // Act
      const result = await listEventsUseCase.execute(input);

      // Assert
      expect(
        mockEventRepository.findByStatusWithPagination
      ).toHaveBeenCalledWith("PUBLISHED", 0, 10);
      expect(result).toEqual({
        items: publishedEvents,
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should list events by event type with pagination", async () => {
      // Arrange
      const input: ListEventsInput = {
        eventType: "WORKSHOP",
        page: 1,
        limit: 10,
      };

      const workshopEvents: Event[] = [mockEvents[1]!];
      mockEventRepository.findByEventTypeWithPagination.mockResolvedValue({
        events: workshopEvents,
        total: 1,
      });

      // Act
      const result = await listEventsUseCase.execute(input);

      // Assert
      expect(
        mockEventRepository.findByEventTypeWithPagination
      ).toHaveBeenCalledWith("WORKSHOP", 0, 10);
      expect(result).toEqual({
        items: workshopEvents,
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should list events by organizer with pagination", async () => {
      // Arrange
      const input: ListEventsInput = {
        organizerType: "USER",
        organizerId: "user-1",
        page: 1,
        limit: 10,
      };

      const organizerEvents: Event[] = [mockEvents[0]!];
      mockEventRepository.findByOrganizerWithPagination.mockResolvedValue({
        events: organizerEvents,
        total: 1,
      });

      // Act
      const result = await listEventsUseCase.execute(input);

      // Assert
      expect(
        mockEventRepository.findByOrganizerWithPagination
      ).toHaveBeenCalledWith("USER", "user-1", 0, 10);
      expect(result).toEqual({
        items: organizerEvents,
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should list public events with pagination", async () => {
      // Arrange
      const input: ListEventsInput = {
        isPublic: true,
        page: 1,
        limit: 10,
      };

      const publicEvents: Event[] = [mockEvents[0]!];
      mockEventRepository.findPublicEventsWithPagination.mockResolvedValue({
        events: publicEvents,
        total: 1,
      });

      // Act
      const result = await listEventsUseCase.execute(input);

      // Assert
      expect(
        mockEventRepository.findPublicEventsWithPagination
      ).toHaveBeenCalledWith(0, 10);
      expect(result).toEqual({
        items: publicEvents,
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should list upcoming events with pagination", async () => {
      // Arrange
      const input: ListEventsInput = {
        upcomingOnly: true,
        page: 1,
        limit: 10,
      };

      const upcomingEvents: Event[] = [mockEvents[0]!];
      mockEventRepository.findUpcomingEventsWithPagination.mockResolvedValue({
        events: upcomingEvents,
        total: 1,
      });

      // Act
      const result = await listEventsUseCase.execute(input);

      // Assert
      expect(
        mockEventRepository.findUpcomingEventsWithPagination
      ).toHaveBeenCalledWith(0, 10);
      expect(result).toEqual({
        items: upcomingEvents,
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should list events by date range with pagination", async () => {
      // Arrange
      const startDate = new Date("2025-12-25");
      const endDate = new Date("2025-12-31");
      const input: ListEventsInput = {
        startDate,
        endDate,
        page: 1,
        limit: 10,
      };

      const dateRangeEvents: Event[] = [mockEvents[0]!];
      mockEventRepository.findEventsByDateRangeWithPagination.mockResolvedValue(
        {
          events: dateRangeEvents,
          total: 1,
        }
      );

      // Act
      const result = await listEventsUseCase.execute(input);

      // Assert
      expect(
        mockEventRepository.findEventsByDateRangeWithPagination
      ).toHaveBeenCalledWith(startDate, endDate, 0, 10);
      expect(result).toEqual({
        items: dateRangeEvents,
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should handle pagination correctly with multiple pages", async () => {
      // Arrange
      const input: ListEventsInput = {
        page: 2,
        limit: 1,
      };

      const secondPageEvents: Event[] = [mockEvents[1]!];
      mockEventRepository.findAllWithPagination.mockResolvedValue({
        events: secondPageEvents,
        total: 2,
      });

      // Act
      const result = await listEventsUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findAllWithPagination).toHaveBeenCalledWith(
        1,
        1
      );
      expect(result).toEqual({
        items: secondPageEvents,
        pagination: {
          total: 2,
          page: 2,
          limit: 1,
          totalPages: 2,
        },
      });
    });

    it("should use default pagination when no page/limit provided", async () => {
      // Arrange
      const input: ListEventsInput = {};

      mockEventRepository.findAllWithPagination.mockResolvedValue({
        events: mockEvents,
        total: 2,
      });

      // Act
      const result = await listEventsUseCase.execute(input);

      // Assert
      expect(mockEventRepository.findAllWithPagination).toHaveBeenCalledWith(
        0,
        10
      );
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it("should throw AppException when repository fails", async () => {
      // Arrange
      const input: ListEventsInput = {
        page: 1,
        limit: 10,
      };

      const repositoryError = new Error("Database connection failed");
      mockEventRepository.findAllWithPagination.mockRejectedValue(
        repositoryError
      );

      // Act & Assert
      await expect(listEventsUseCase.execute(input)).rejects.toThrow(
        new AppException(
          "Error listing events: Database connection failed",
          500
        )
      );
    });

    it("should handle empty results", async () => {
      // Arrange
      const input: ListEventsInput = {
        page: 1,
        limit: 10,
      };

      mockEventRepository.findAllWithPagination.mockResolvedValue({
        events: [],
        total: 0,
      });

      // Act
      const result = await listEventsUseCase.execute(input);

      // Assert
      expect(result).toEqual({
        items: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      });
    });

    it("should handle large datasets with correct total pages calculation", async () => {
      // Arrange
      const input: ListEventsInput = {
        page: 1,
        limit: 5,
      };

      mockEventRepository.findAllWithPagination.mockResolvedValue({
        events: mockEvents,
        total: 23, // 23 total events
      });

      // Act
      const result = await listEventsUseCase.execute(input);

      // Assert
      expect(result.pagination.totalPages).toBe(5); // Math.ceil(23/5) = 5
      expect(result.pagination.total).toBe(23);
    });
  });
});
