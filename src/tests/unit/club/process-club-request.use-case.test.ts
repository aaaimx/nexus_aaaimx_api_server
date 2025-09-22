import {
  ProcessClubRequestUseCase,
  ProcessClubRequestRequest,
} from "@/application/use-cases/club/process-club-request.use-case";
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

describe("ProcessClubRequestUseCase", () => {
  let processClubRequestUseCase: ProcessClubRequestUseCase;
  let mockClubRequestRepository: jest.Mocked<IClubRequestRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  const mockRequest: ClubRequest = createMockClubRequest({
    id: "request-123",
    userId: "user-456",
    clubId: "club-123",
    status: RequestStatus.PENDING,
  });

  const mockProcessRequest: ProcessClubRequestRequest = {
    requestId: "request-123",
    action: "approve",
    adminMessage: "Welcome to the club!",
    userId: "leader-123",
    userRoles: [ROLE_NAMES.LEADER],
  };

  beforeEach(() => {
    // Create mocks
    mockClubRequestRepository = createMockClubRequestRepository();
    mockUserRepository = createMockUserRepository();

    // Create use case instance
    processClubRequestUseCase = new ProcessClubRequestUseCase(
      mockClubRequestRepository,
      mockUserRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should approve a club request successfully with leader role", async () => {
      // Arrange
      const approvedRequest = mockRequest.approve("Welcome to the club!");
      mockClubRequestRepository.findById.mockResolvedValue(mockRequest);
      mockUserRepository.getUserClubs.mockResolvedValue(["club-123"]);
      mockClubRequestRepository.update.mockResolvedValue(approvedRequest);

      // Act
      const result = await processClubRequestUseCase.execute(mockProcessRequest);

      // Assert
      expect(mockClubRequestRepository.findById).toHaveBeenCalledWith("request-123");
      expect(mockUserRepository.getUserClubs).toHaveBeenCalledWith("leader-123");
      expect(mockClubRequestRepository.update).toHaveBeenCalledWith(
        "request-123",
        expect.objectContaining({
          status: RequestStatus.APPROVED,
          adminMessage: "Welcome to the club!",
        })
      );
      expect(result).toEqual({
        request: approvedRequest,
        message: "Club request approved successfully",
      });
    });

    it("should approve a club request successfully with co-leader role", async () => {
      // Arrange
      const requestWithCoLeader: ProcessClubRequestRequest = {
        ...mockProcessRequest,
        userRoles: [ROLE_NAMES.CO_LEADER],
      };
      const approvedRequest = mockRequest.approve("Welcome to the club!");
      mockClubRequestRepository.findById.mockResolvedValue(mockRequest);
      mockUserRepository.getUserClubs.mockResolvedValue(["club-123"]);
      mockClubRequestRepository.update.mockResolvedValue(approvedRequest);

      // Act
      const result = await processClubRequestUseCase.execute(requestWithCoLeader);

      // Assert
      expect(mockClubRequestRepository.findById).toHaveBeenCalledWith("request-123");
      expect(mockUserRepository.getUserClubs).toHaveBeenCalledWith("leader-123");
      expect(result).toEqual({
        request: approvedRequest,
        message: "Club request approved successfully",
      });
    });

    it("should reject a club request successfully", async () => {
      // Arrange
      const rejectRequest: ProcessClubRequestRequest = {
        ...mockProcessRequest,
        action: "reject",
        adminMessage: "Not a good fit at this time",
      };
      const rejectedRequest = mockRequest.reject("Not a good fit at this time");
      mockClubRequestRepository.findById.mockResolvedValue(mockRequest);
      mockUserRepository.getUserClubs.mockResolvedValue(["club-123"]);
      mockClubRequestRepository.update.mockResolvedValue(rejectedRequest);

      // Act
      const result = await processClubRequestUseCase.execute(rejectRequest);

      // Assert
      expect(mockClubRequestRepository.findById).toHaveBeenCalledWith("request-123");
      expect(mockUserRepository.getUserClubs).toHaveBeenCalledWith("leader-123");
      expect(mockClubRequestRepository.update).toHaveBeenCalledWith(
        "request-123",
        expect.objectContaining({
          status: RequestStatus.REJECTED,
          adminMessage: "Not a good fit at this time",
        })
      );
      expect(result).toEqual({
        request: rejectedRequest,
        message: "Club request rejected successfully",
      });
    });

    it("should throw AppException when request not found", async () => {
      // Arrange
      mockClubRequestRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        processClubRequestUseCase.execute(mockProcessRequest)
      ).rejects.toThrow(
        new AppException("Club request not found", 404)
      );
      expect(mockClubRequestRepository.findById).toHaveBeenCalledWith("request-123");
      expect(mockUserRepository.getUserClubs).not.toHaveBeenCalled();
      expect(mockClubRequestRepository.update).not.toHaveBeenCalled();
    });

    it("should throw AppException when request is not pending", async () => {
      // Arrange
      const approvedRequest = createMockClubRequest({
        status: RequestStatus.APPROVED,
      });
      mockClubRequestRepository.findById.mockResolvedValue(approvedRequest);

      // Act & Assert
      await expect(
        processClubRequestUseCase.execute(mockProcessRequest)
      ).rejects.toThrow(
        new AppException("Only pending requests can be processed", 400)
      );
      expect(mockClubRequestRepository.findById).toHaveBeenCalledWith("request-123");
      expect(mockUserRepository.getUserClubs).not.toHaveBeenCalled();
      expect(mockClubRequestRepository.update).not.toHaveBeenCalled();
    });

    it("should throw AppException when user has insufficient role", async () => {
      // Arrange
      const requestWithMemberRole: ProcessClubRequestRequest = {
        ...mockProcessRequest,
        userRoles: [ROLE_NAMES.MEMBER],
      };
      mockClubRequestRepository.findById.mockResolvedValue(mockRequest);

      // Act & Assert
      await expect(
        processClubRequestUseCase.execute(requestWithMemberRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only leaders and co-leaders can process club requests.",
          403
        )
      );
      expect(mockClubRequestRepository.findById).toHaveBeenCalledWith("request-123");
      expect(mockUserRepository.getUserClubs).not.toHaveBeenCalled();
      expect(mockClubRequestRepository.update).not.toHaveBeenCalled();
    });

    it("should throw AppException when user is not member of the club", async () => {
      // Arrange
      mockClubRequestRepository.findById.mockResolvedValue(mockRequest);
      mockUserRepository.getUserClubs.mockResolvedValue(["club-456"]); // Different club

      // Act & Assert
      await expect(
        processClubRequestUseCase.execute(mockProcessRequest)
      ).rejects.toThrow(
        new AppException(
          "You can only process requests for clubs you belong to.",
          403
        )
      );
      expect(mockClubRequestRepository.findById).toHaveBeenCalledWith("request-123");
      expect(mockUserRepository.getUserClubs).toHaveBeenCalledWith("leader-123");
      expect(mockClubRequestRepository.update).not.toHaveBeenCalled();
    });

    it("should throw AppException when user has no roles", async () => {
      // Arrange
      const requestWithNoRoles: ProcessClubRequestRequest = {
        ...mockProcessRequest,
        userRoles: [],
      };
      mockClubRequestRepository.findById.mockResolvedValue(mockRequest);

      // Act & Assert
      await expect(
        processClubRequestUseCase.execute(requestWithNoRoles)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only leaders and co-leaders can process club requests.",
          403
        )
      );
    });

    it("should work with multiple roles where one is allowed", async () => {
      // Arrange
      const requestWithMultipleRoles: ProcessClubRequestRequest = {
        ...mockProcessRequest,
        userRoles: [ROLE_NAMES.MEMBER, ROLE_NAMES.LEADER, ROLE_NAMES.SENIOR_MEMBER],
      };
      const approvedRequest = mockRequest.approve("Welcome to the club!");
      mockClubRequestRepository.findById.mockResolvedValue(mockRequest);
      mockUserRepository.getUserClubs.mockResolvedValue(["club-123"]);
      mockClubRequestRepository.update.mockResolvedValue(approvedRequest);

      // Act
      const result = await processClubRequestUseCase.execute(requestWithMultipleRoles);

      // Assert
      expect(result).toEqual({
        request: approvedRequest,
        message: "Club request approved successfully",
      });
    });

    it("should handle repository errors gracefully", async () => {
      // Arrange
      const repositoryError = new Error("Database connection failed");
      mockClubRequestRepository.findById.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(
        processClubRequestUseCase.execute(mockProcessRequest)
      ).rejects.toThrow(repositoryError);
    });

    it("should process request without admin message", async () => {
      // Arrange
      const requestWithoutMessage: ProcessClubRequestRequest = {
        ...mockProcessRequest,
        adminMessage: undefined,
      };
      const approvedRequest = mockRequest.approve(undefined);
      mockClubRequestRepository.findById.mockResolvedValue(mockRequest);
      mockUserRepository.getUserClubs.mockResolvedValue(["club-123"]);
      mockClubRequestRepository.update.mockResolvedValue(approvedRequest);

      // Act
      const result = await processClubRequestUseCase.execute(requestWithoutMessage);

      // Assert
      expect(mockClubRequestRepository.update).toHaveBeenCalledWith(
        "request-123",
        expect.objectContaining({
          status: RequestStatus.APPROVED,
          adminMessage: undefined,
        })
      );
      expect(result).toEqual({
        request: approvedRequest,
        message: "Club request approved successfully",
      });
    });

    it("should handle committee role as insufficient permission", async () => {
      // Arrange
      const requestWithCommitteeRole: ProcessClubRequestRequest = {
        ...mockProcessRequest,
        userRoles: [ROLE_NAMES.COMMITTEE],
      };
      mockClubRequestRepository.findById.mockResolvedValue(mockRequest);

      // Act & Assert
      await expect(
        processClubRequestUseCase.execute(requestWithCommitteeRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only leaders and co-leaders can process club requests.",
          403
        )
      );
    });

    it("should handle president role as insufficient permission", async () => {
      // Arrange
      const requestWithPresidentRole: ProcessClubRequestRequest = {
        ...mockProcessRequest,
        userRoles: [ROLE_NAMES.PRESIDENT],
      };
      mockClubRequestRepository.findById.mockResolvedValue(mockRequest);

      // Act & Assert
      await expect(
        processClubRequestUseCase.execute(requestWithPresidentRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only leaders and co-leaders can process club requests.",
          403
        )
      );
    });
  });
});
