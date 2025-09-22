import {
  ListDivisionRequestsUseCase,
  ListDivisionRequestsRequest,
} from "@/application/use-cases/division/list-division-requests.use-case";
import { IDivisionRequestRepository } from "@/domain/repositories/division-request.repository";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { DivisionRequest, RequestStatus } from "@/domain/entities/division-request.entity";
import AppException from "@/shared/utils/exception.util";
import { ROLE_NAMES } from "@/shared/constants";
import {
  createMockDivisionRequestRepository,
  createMockUserRepository,
  createMockDivisionRequest,
} from "@/tests/test-helpers";

// Mock logger
jest.mock("@/infrastructure/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe("ListDivisionRequestsUseCase", () => {
  let listDivisionRequestsUseCase: ListDivisionRequestsUseCase;
  let mockDivisionRequestRepository: jest.Mocked<IDivisionRequestRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  const mockDivisionRequests: DivisionRequest[] = [
    createMockDivisionRequest({
      id: "request-1",
      userId: "user-1",
      divisionId: "division-123",
      status: RequestStatus.PENDING,
      createdAt: new Date("2024-01-01"),
    }),
    createMockDivisionRequest({
      id: "request-2",
      userId: "user-2",
      divisionId: "division-123",
      status: RequestStatus.APPROVED,
      createdAt: new Date("2024-01-02"),
    }),
  ];

  const mockListRequest: ListDivisionRequestsRequest = {
    userId: "leader-123",
    userRoles: [ROLE_NAMES.LEADER],
    divisionId: "division-123",
  };

  beforeEach(() => {
    // Create mocks
    mockDivisionRequestRepository = createMockDivisionRequestRepository();
    mockUserRepository = createMockUserRepository();

    // Create use case instance
    listDivisionRequestsUseCase = new ListDivisionRequestsUseCase(
      mockDivisionRequestRepository,
      mockUserRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should list division requests for specific division with leader role", async () => {
      // Arrange
      mockUserRepository.getUserDivisions.mockResolvedValue(["division-123"]);
      mockDivisionRequestRepository.findByDivision.mockResolvedValue(mockDivisionRequests);

      // Act
      const result = await listDivisionRequestsUseCase.execute(mockListRequest);

      // Assert
      expect(mockUserRepository.getUserDivisions).toHaveBeenCalledWith("leader-123");
      expect(mockDivisionRequestRepository.findByDivision).toHaveBeenCalledWith("division-123");
      expect(result).toEqual({
        requests: mockDivisionRequests,
      });
    });

    it("should list division requests for specific division with co-leader role", async () => {
      // Arrange
      const requestWithCoLeader: ListDivisionRequestsRequest = {
        ...mockListRequest,
        userRoles: [ROLE_NAMES.CO_LEADER],
      };
      mockUserRepository.getUserDivisions.mockResolvedValue(["division-123"]);
      mockDivisionRequestRepository.findByDivision.mockResolvedValue(mockDivisionRequests);

      // Act
      const result = await listDivisionRequestsUseCase.execute(requestWithCoLeader);

      // Assert
      expect(mockUserRepository.getUserDivisions).toHaveBeenCalledWith("leader-123");
      expect(mockDivisionRequestRepository.findByDivision).toHaveBeenCalledWith("division-123");
      expect(result).toEqual({
        requests: mockDivisionRequests,
      });
    });

    it("should list division requests for all user divisions when no specific division", async () => {
      // Arrange
      const requestAllDivisions: ListDivisionRequestsRequest = {
        userId: "leader-123",
        userRoles: [ROLE_NAMES.LEADER],
      };
      const division1Requests = [mockDivisionRequests[0]];
      const division2Requests = [mockDivisionRequests[1]];
      
      mockUserRepository.getUserDivisions.mockResolvedValue(["division-123", "division-456"]);
      mockDivisionRequestRepository.findByDivision
        .mockResolvedValueOnce(division1Requests)
        .mockResolvedValueOnce(division2Requests);

      // Act
      const result = await listDivisionRequestsUseCase.execute(requestAllDivisions);

      // Assert
      expect(mockUserRepository.getUserDivisions).toHaveBeenCalledWith("leader-123");
      expect(mockDivisionRequestRepository.findByDivision).toHaveBeenCalledWith("division-123");
      expect(mockDivisionRequestRepository.findByDivision).toHaveBeenCalledWith("division-456");
      expect(result.requests).toHaveLength(2);
      // Should be sorted by creation date (newest first)
      expect(result.requests[0].createdAt.getTime()).toBeGreaterThan(
        result.requests[1].createdAt.getTime()
      );
    });

    it("should return empty array when user has no divisions", async () => {
      // Arrange
      const requestAllDivisions: ListDivisionRequestsRequest = {
        userId: "leader-123",
        userRoles: [ROLE_NAMES.LEADER],
      };
      mockUserRepository.getUserDivisions.mockResolvedValue([]);

      // Act
      const result = await listDivisionRequestsUseCase.execute(requestAllDivisions);

      // Assert
      expect(mockUserRepository.getUserDivisions).toHaveBeenCalledWith("leader-123");
      expect(mockDivisionRequestRepository.findByDivision).not.toHaveBeenCalled();
      expect(result).toEqual({
        requests: [],
      });
    });

    it("should throw AppException when user has insufficient role", async () => {
      // Arrange
      const requestWithMemberRole: ListDivisionRequestsRequest = {
        ...mockListRequest,
        userRoles: [ROLE_NAMES.MEMBER],
      };

      // Act & Assert
      await expect(
        listDivisionRequestsUseCase.execute(requestWithMemberRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only leaders and co-leaders can view division requests.",
          403
        )
      );
      expect(mockUserRepository.getUserDivisions).not.toHaveBeenCalled();
      expect(mockDivisionRequestRepository.findByDivision).not.toHaveBeenCalled();
    });

    it("should throw AppException when user is not member of specified division", async () => {
      // Arrange
      mockUserRepository.getUserDivisions.mockResolvedValue(["division-456"]); // Different division

      // Act & Assert
      await expect(
        listDivisionRequestsUseCase.execute(mockListRequest)
      ).rejects.toThrow(
        new AppException(
          "You can only view requests for divisions you belong to.",
          403
        )
      );
      expect(mockUserRepository.getUserDivisions).toHaveBeenCalledWith("leader-123");
      expect(mockDivisionRequestRepository.findByDivision).not.toHaveBeenCalled();
    });

    it("should throw AppException when user has no roles", async () => {
      // Arrange
      const requestWithNoRoles: ListDivisionRequestsRequest = {
        ...mockListRequest,
        userRoles: [],
      };

      // Act & Assert
      await expect(
        listDivisionRequestsUseCase.execute(requestWithNoRoles)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only leaders and co-leaders can view division requests.",
          403
        )
      );
    });

    it("should work with multiple roles where one is allowed", async () => {
      // Arrange
      const requestWithMultipleRoles: ListDivisionRequestsRequest = {
        ...mockListRequest,
        userRoles: [ROLE_NAMES.MEMBER, ROLE_NAMES.LEADER, ROLE_NAMES.SENIOR_MEMBER],
      };
      mockUserRepository.getUserDivisions.mockResolvedValue(["division-123"]);
      mockDivisionRequestRepository.findByDivision.mockResolvedValue(mockDivisionRequests);

      // Act
      const result = await listDivisionRequestsUseCase.execute(requestWithMultipleRoles);

      // Assert
      expect(result).toEqual({
        requests: mockDivisionRequests,
      });
    });

    it("should handle repository errors gracefully", async () => {
      // Arrange
      const repositoryError = new Error("Database connection failed");
      mockUserRepository.getUserDivisions.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(
        listDivisionRequestsUseCase.execute(mockListRequest)
      ).rejects.toThrow(repositoryError);
    });

    it("should handle committee role as insufficient permission", async () => {
      // Arrange
      const requestWithCommitteeRole: ListDivisionRequestsRequest = {
        ...mockListRequest,
        userRoles: [ROLE_NAMES.COMMITTEE],
      };

      // Act & Assert
      await expect(
        listDivisionRequestsUseCase.execute(requestWithCommitteeRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only leaders and co-leaders can view division requests.",
          403
        )
      );
    });

    it("should handle president role as insufficient permission", async () => {
      // Arrange
      const requestWithPresidentRole: ListDivisionRequestsRequest = {
        ...mockListRequest,
        userRoles: [ROLE_NAMES.PRESIDENT],
      };

      // Act & Assert
      await expect(
        listDivisionRequestsUseCase.execute(requestWithPresidentRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only leaders and co-leaders can view division requests.",
          403
        )
      );
    });

    it("should return empty array when division has no requests", async () => {
      // Arrange
      mockUserRepository.getUserDivisions.mockResolvedValue(["division-123"]);
      mockDivisionRequestRepository.findByDivision.mockResolvedValue([]);

      // Act
      const result = await listDivisionRequestsUseCase.execute(mockListRequest);

      // Assert
      expect(result).toEqual({
        requests: [],
      });
    });
  });
});
