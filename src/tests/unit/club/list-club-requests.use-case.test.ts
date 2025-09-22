import {
  ListClubRequestsUseCase,
  ListClubRequestsRequest,
} from "@/application/use-cases/club/list-club-requests.use-case";
import { IClubRequestRepository } from "@/domain/repositories/club-request.repository";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { ClubRequest, RequestStatus } from "@/domain/entities/club-request.entity";
import AppException from "@/shared/utils/exception.util";
import { ROLE_NAMES } from "@/shared/constants";
import {
  createMockClubRequestRepository,
  createMockUserRepository,
  createMockClubRequest,
} from "@/tests/test-helpers";

// Mock logger
jest.mock("@/infrastructure/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe("ListClubRequestsUseCase", () => {
  let listClubRequestsUseCase: ListClubRequestsUseCase;
  let mockClubRequestRepository: jest.Mocked<IClubRequestRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  const mockClubRequests: ClubRequest[] = [
    createMockClubRequest({
      id: "request-1",
      userId: "user-1",
      clubId: "club-123",
      status: RequestStatus.PENDING,
      createdAt: new Date("2024-01-01"),
    }),
    createMockClubRequest({
      id: "request-2",
      userId: "user-2",
      clubId: "club-123",
      status: RequestStatus.APPROVED,
      createdAt: new Date("2024-01-02"),
    }),
  ];

  const mockListRequest: ListClubRequestsRequest = {
    userId: "leader-123",
    userRoles: [ROLE_NAMES.LEADER],
    clubId: "club-123",
  };

  beforeEach(() => {
    // Create mocks
    mockClubRequestRepository = createMockClubRequestRepository();
    mockUserRepository = createMockUserRepository();

    // Create use case instance
    listClubRequestsUseCase = new ListClubRequestsUseCase(
      mockClubRequestRepository,
      mockUserRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should list club requests for specific club with leader role", async () => {
      // Arrange
      mockUserRepository.getUserClubs.mockResolvedValue(["club-123"]);
      mockClubRequestRepository.findByClub.mockResolvedValue(mockClubRequests);

      // Act
      const result = await listClubRequestsUseCase.execute(mockListRequest);

      // Assert
      expect(mockUserRepository.getUserClubs).toHaveBeenCalledWith("leader-123");
      expect(mockClubRequestRepository.findByClub).toHaveBeenCalledWith("club-123");
      expect(result).toEqual({
        requests: mockClubRequests,
      });
    });

    it("should list club requests for specific club with co-leader role", async () => {
      // Arrange
      const requestWithCoLeader: ListClubRequestsRequest = {
        ...mockListRequest,
        userRoles: [ROLE_NAMES.CO_LEADER],
      };
      mockUserRepository.getUserClubs.mockResolvedValue(["club-123"]);
      mockClubRequestRepository.findByClub.mockResolvedValue(mockClubRequests);

      // Act
      const result = await listClubRequestsUseCase.execute(requestWithCoLeader);

      // Assert
      expect(mockUserRepository.getUserClubs).toHaveBeenCalledWith("leader-123");
      expect(mockClubRequestRepository.findByClub).toHaveBeenCalledWith("club-123");
      expect(result).toEqual({
        requests: mockClubRequests,
      });
    });

    it("should list club requests for all user clubs when no specific club", async () => {
      // Arrange
      const requestAllClubs: ListClubRequestsRequest = {
        userId: "leader-123",
        userRoles: [ROLE_NAMES.LEADER],
      };
      const club1Requests = [mockClubRequests[0]];
      const club2Requests = [mockClubRequests[1]];
      
      mockUserRepository.getUserClubs.mockResolvedValue(["club-123", "club-456"]);
      mockClubRequestRepository.findByClub
        .mockResolvedValueOnce(club1Requests)
        .mockResolvedValueOnce(club2Requests);

      // Act
      const result = await listClubRequestsUseCase.execute(requestAllClubs);

      // Assert
      expect(mockUserRepository.getUserClubs).toHaveBeenCalledWith("leader-123");
      expect(mockClubRequestRepository.findByClub).toHaveBeenCalledWith("club-123");
      expect(mockClubRequestRepository.findByClub).toHaveBeenCalledWith("club-456");
      expect(result.requests).toHaveLength(2);
      // Should be sorted by creation date (newest first)
      expect(result.requests[0].createdAt.getTime()).toBeGreaterThan(
        result.requests[1].createdAt.getTime()
      );
    });

    it("should return empty array when user has no clubs", async () => {
      // Arrange
      const requestAllClubs: ListClubRequestsRequest = {
        userId: "leader-123",
        userRoles: [ROLE_NAMES.LEADER],
      };
      mockUserRepository.getUserClubs.mockResolvedValue([]);

      // Act
      const result = await listClubRequestsUseCase.execute(requestAllClubs);

      // Assert
      expect(mockUserRepository.getUserClubs).toHaveBeenCalledWith("leader-123");
      expect(mockClubRequestRepository.findByClub).not.toHaveBeenCalled();
      expect(result).toEqual({
        requests: [],
      });
    });

    it("should throw AppException when user has insufficient role", async () => {
      // Arrange
      const requestWithMemberRole: ListClubRequestsRequest = {
        ...mockListRequest,
        userRoles: [ROLE_NAMES.MEMBER],
      };

      // Act & Assert
      await expect(
        listClubRequestsUseCase.execute(requestWithMemberRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only leaders and co-leaders can view club requests.",
          403
        )
      );
      expect(mockUserRepository.getUserClubs).not.toHaveBeenCalled();
      expect(mockClubRequestRepository.findByClub).not.toHaveBeenCalled();
    });

    it("should throw AppException when user is not member of specified club", async () => {
      // Arrange
      mockUserRepository.getUserClubs.mockResolvedValue(["club-456"]); // Different club

      // Act & Assert
      await expect(
        listClubRequestsUseCase.execute(mockListRequest)
      ).rejects.toThrow(
        new AppException(
          "You can only view requests for clubs you belong to.",
          403
        )
      );
      expect(mockUserRepository.getUserClubs).toHaveBeenCalledWith("leader-123");
      expect(mockClubRequestRepository.findByClub).not.toHaveBeenCalled();
    });

    it("should throw AppException when user has no roles", async () => {
      // Arrange
      const requestWithNoRoles: ListClubRequestsRequest = {
        ...mockListRequest,
        userRoles: [],
      };

      // Act & Assert
      await expect(
        listClubRequestsUseCase.execute(requestWithNoRoles)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only leaders and co-leaders can view club requests.",
          403
        )
      );
    });

    it("should work with multiple roles where one is allowed", async () => {
      // Arrange
      const requestWithMultipleRoles: ListClubRequestsRequest = {
        ...mockListRequest,
        userRoles: [ROLE_NAMES.MEMBER, ROLE_NAMES.LEADER, ROLE_NAMES.SENIOR_MEMBER],
      };
      mockUserRepository.getUserClubs.mockResolvedValue(["club-123"]);
      mockClubRequestRepository.findByClub.mockResolvedValue(mockClubRequests);

      // Act
      const result = await listClubRequestsUseCase.execute(requestWithMultipleRoles);

      // Assert
      expect(result).toEqual({
        requests: mockClubRequests,
      });
    });

    it("should handle repository errors gracefully", async () => {
      // Arrange
      const repositoryError = new Error("Database connection failed");
      mockUserRepository.getUserClubs.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(
        listClubRequestsUseCase.execute(mockListRequest)
      ).rejects.toThrow(repositoryError);
    });

    it("should handle committee role as insufficient permission", async () => {
      // Arrange
      const requestWithCommitteeRole: ListClubRequestsRequest = {
        ...mockListRequest,
        userRoles: [ROLE_NAMES.COMMITTEE],
      };

      // Act & Assert
      await expect(
        listClubRequestsUseCase.execute(requestWithCommitteeRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only leaders and co-leaders can view club requests.",
          403
        )
      );
    });

    it("should handle president role as insufficient permission", async () => {
      // Arrange
      const requestWithPresidentRole: ListClubRequestsRequest = {
        ...mockListRequest,
        userRoles: [ROLE_NAMES.PRESIDENT],
      };

      // Act & Assert
      await expect(
        listClubRequestsUseCase.execute(requestWithPresidentRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only leaders and co-leaders can view club requests.",
          403
        )
      );
    });

    it("should return empty array when club has no requests", async () => {
      // Arrange
      mockUserRepository.getUserClubs.mockResolvedValue(["club-123"]);
      mockClubRequestRepository.findByClub.mockResolvedValue([]);

      // Act
      const result = await listClubRequestsUseCase.execute(mockListRequest);

      // Assert
      expect(result).toEqual({
        requests: [],
      });
    });

    it("should handle senior member role as insufficient permission", async () => {
      // Arrange
      const requestWithSeniorMemberRole: ListClubRequestsRequest = {
        ...mockListRequest,
        userRoles: [ROLE_NAMES.SENIOR_MEMBER],
      };

      // Act & Assert
      await expect(
        listClubRequestsUseCase.execute(requestWithSeniorMemberRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only leaders and co-leaders can view club requests.",
          403
        )
      );
    });

    it("should handle multiple clubs with different request counts", async () => {
      // Arrange
      const requestAllClubs: ListClubRequestsRequest = {
        userId: "leader-123",
        userRoles: [ROLE_NAMES.LEADER],
      };
      const club1Requests = [mockClubRequests[0], mockClubRequests[1]];
      const club2Requests: ClubRequest[] = []; // Empty array
      
      mockUserRepository.getUserClubs.mockResolvedValue(["club-123", "club-456"]);
      mockClubRequestRepository.findByClub
        .mockResolvedValueOnce(club1Requests)
        .mockResolvedValueOnce(club2Requests);

      // Act
      const result = await listClubRequestsUseCase.execute(requestAllClubs);

      // Assert
      expect(result.requests).toHaveLength(2);
      expect(result.requests).toEqual(club1Requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    });
  });
});
