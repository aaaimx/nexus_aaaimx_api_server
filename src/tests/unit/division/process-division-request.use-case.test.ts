import {
  ProcessDivisionRequestUseCase,
  ProcessDivisionRequestRequest,
} from "@/application/use-cases/division/process-division-request.use-case";
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

describe("ProcessDivisionRequestUseCase", () => {
  let processDivisionRequestUseCase: ProcessDivisionRequestUseCase;
  let mockDivisionRequestRepository: jest.Mocked<IDivisionRequestRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  const mockRequest: DivisionRequest = createMockDivisionRequest({
    id: "request-123",
    userId: "user-456",
    divisionId: "division-123",
    status: RequestStatus.PENDING,
  });

  const mockProcessRequest: ProcessDivisionRequestRequest = {
    requestId: "request-123",
    action: "approve",
    adminMessage: "Welcome to the division!",
    userId: "leader-123",
    userRoles: [ROLE_NAMES.LEADER],
  };

  beforeEach(() => {
    // Create mocks
    mockDivisionRequestRepository = createMockDivisionRequestRepository();
    mockUserRepository = createMockUserRepository();

    // Create use case instance
    processDivisionRequestUseCase = new ProcessDivisionRequestUseCase(
      mockDivisionRequestRepository,
      mockUserRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should approve a division request successfully with leader role", async () => {
      // Arrange
      const approvedRequest = mockRequest.approve("Welcome to the division!");
      mockDivisionRequestRepository.findById.mockResolvedValue(mockRequest);
      mockUserRepository.getUserDivisions.mockResolvedValue(["division-123"]);
      mockDivisionRequestRepository.update.mockResolvedValue(approvedRequest);

      // Act
      const result = await processDivisionRequestUseCase.execute(mockProcessRequest);

      // Assert
      expect(mockDivisionRequestRepository.findById).toHaveBeenCalledWith("request-123");
      expect(mockUserRepository.getUserDivisions).toHaveBeenCalledWith("leader-123");
      expect(mockDivisionRequestRepository.update).toHaveBeenCalledWith(
        "request-123",
        expect.objectContaining({
          status: RequestStatus.APPROVED,
          adminMessage: "Welcome to the division!",
        })
      );
      expect(result).toEqual({
        request: approvedRequest,
        message: "Division request approved successfully",
      });
    });

    it("should approve a division request successfully with co-leader role", async () => {
      // Arrange
      const requestWithCoLeader: ProcessDivisionRequestRequest = {
        ...mockProcessRequest,
        userRoles: [ROLE_NAMES.CO_LEADER],
      };
      const approvedRequest = mockRequest.approve("Welcome to the division!");
      mockDivisionRequestRepository.findById.mockResolvedValue(mockRequest);
      mockUserRepository.getUserDivisions.mockResolvedValue(["division-123"]);
      mockDivisionRequestRepository.update.mockResolvedValue(approvedRequest);

      // Act
      const result = await processDivisionRequestUseCase.execute(requestWithCoLeader);

      // Assert
      expect(mockDivisionRequestRepository.findById).toHaveBeenCalledWith("request-123");
      expect(mockUserRepository.getUserDivisions).toHaveBeenCalledWith("leader-123");
      expect(result).toEqual({
        request: approvedRequest,
        message: "Division request approved successfully",
      });
    });

    it("should reject a division request successfully", async () => {
      // Arrange
      const rejectRequest: ProcessDivisionRequestRequest = {
        ...mockProcessRequest,
        action: "reject",
        adminMessage: "Not a good fit at this time",
      };
      const rejectedRequest = mockRequest.reject("Not a good fit at this time");
      mockDivisionRequestRepository.findById.mockResolvedValue(mockRequest);
      mockUserRepository.getUserDivisions.mockResolvedValue(["division-123"]);
      mockDivisionRequestRepository.update.mockResolvedValue(rejectedRequest);

      // Act
      const result = await processDivisionRequestUseCase.execute(rejectRequest);

      // Assert
      expect(mockDivisionRequestRepository.findById).toHaveBeenCalledWith("request-123");
      expect(mockUserRepository.getUserDivisions).toHaveBeenCalledWith("leader-123");
      expect(mockDivisionRequestRepository.update).toHaveBeenCalledWith(
        "request-123",
        expect.objectContaining({
          status: RequestStatus.REJECTED,
          adminMessage: "Not a good fit at this time",
        })
      );
      expect(result).toEqual({
        request: rejectedRequest,
        message: "Division request rejected successfully",
      });
    });

    it("should throw AppException when request not found", async () => {
      // Arrange
      mockDivisionRequestRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        processDivisionRequestUseCase.execute(mockProcessRequest)
      ).rejects.toThrow(
        new AppException("Division request not found", 404)
      );
      expect(mockDivisionRequestRepository.findById).toHaveBeenCalledWith("request-123");
      expect(mockUserRepository.getUserDivisions).not.toHaveBeenCalled();
      expect(mockDivisionRequestRepository.update).not.toHaveBeenCalled();
    });

    it("should throw AppException when request is not pending", async () => {
      // Arrange
      const approvedRequest = createMockDivisionRequest({
        status: RequestStatus.APPROVED,
      });
      mockDivisionRequestRepository.findById.mockResolvedValue(approvedRequest);

      // Act & Assert
      await expect(
        processDivisionRequestUseCase.execute(mockProcessRequest)
      ).rejects.toThrow(
        new AppException("Only pending requests can be processed", 400)
      );
      expect(mockDivisionRequestRepository.findById).toHaveBeenCalledWith("request-123");
      expect(mockUserRepository.getUserDivisions).not.toHaveBeenCalled();
      expect(mockDivisionRequestRepository.update).not.toHaveBeenCalled();
    });

    it("should throw AppException when user has insufficient role", async () => {
      // Arrange
      const requestWithMemberRole: ProcessDivisionRequestRequest = {
        ...mockProcessRequest,
        userRoles: [ROLE_NAMES.MEMBER],
      };
      mockDivisionRequestRepository.findById.mockResolvedValue(mockRequest);

      // Act & Assert
      await expect(
        processDivisionRequestUseCase.execute(requestWithMemberRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only leaders and co-leaders can process division requests.",
          403
        )
      );
      expect(mockDivisionRequestRepository.findById).toHaveBeenCalledWith("request-123");
      expect(mockUserRepository.getUserDivisions).not.toHaveBeenCalled();
      expect(mockDivisionRequestRepository.update).not.toHaveBeenCalled();
    });

    it("should throw AppException when user is not member of the division", async () => {
      // Arrange
      mockDivisionRequestRepository.findById.mockResolvedValue(mockRequest);
      mockUserRepository.getUserDivisions.mockResolvedValue(["division-456"]); // Different division

      // Act & Assert
      await expect(
        processDivisionRequestUseCase.execute(mockProcessRequest)
      ).rejects.toThrow(
        new AppException(
          "You can only process requests for divisions you belong to.",
          403
        )
      );
      expect(mockDivisionRequestRepository.findById).toHaveBeenCalledWith("request-123");
      expect(mockUserRepository.getUserDivisions).toHaveBeenCalledWith("leader-123");
      expect(mockDivisionRequestRepository.update).not.toHaveBeenCalled();
    });

    it("should throw AppException when user has no roles", async () => {
      // Arrange
      const requestWithNoRoles: ProcessDivisionRequestRequest = {
        ...mockProcessRequest,
        userRoles: [],
      };
      mockDivisionRequestRepository.findById.mockResolvedValue(mockRequest);

      // Act & Assert
      await expect(
        processDivisionRequestUseCase.execute(requestWithNoRoles)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only leaders and co-leaders can process division requests.",
          403
        )
      );
    });

    it("should work with multiple roles where one is allowed", async () => {
      // Arrange
      const requestWithMultipleRoles: ProcessDivisionRequestRequest = {
        ...mockProcessRequest,
        userRoles: [ROLE_NAMES.MEMBER, ROLE_NAMES.LEADER, ROLE_NAMES.SENIOR_MEMBER],
      };
      const approvedRequest = mockRequest.approve("Welcome to the division!");
      mockDivisionRequestRepository.findById.mockResolvedValue(mockRequest);
      mockUserRepository.getUserDivisions.mockResolvedValue(["division-123"]);
      mockDivisionRequestRepository.update.mockResolvedValue(approvedRequest);

      // Act
      const result = await processDivisionRequestUseCase.execute(requestWithMultipleRoles);

      // Assert
      expect(result).toEqual({
        request: approvedRequest,
        message: "Division request approved successfully",
      });
    });

    it("should handle repository errors gracefully", async () => {
      // Arrange
      const repositoryError = new Error("Database connection failed");
      mockDivisionRequestRepository.findById.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(
        processDivisionRequestUseCase.execute(mockProcessRequest)
      ).rejects.toThrow(repositoryError);
    });

    it("should process request without admin message", async () => {
      // Arrange
      const requestWithoutMessage: ProcessDivisionRequestRequest = {
        ...mockProcessRequest,
        adminMessage: undefined,
      };
      const approvedRequest = mockRequest.approve(undefined);
      mockDivisionRequestRepository.findById.mockResolvedValue(mockRequest);
      mockUserRepository.getUserDivisions.mockResolvedValue(["division-123"]);
      mockDivisionRequestRepository.update.mockResolvedValue(approvedRequest);

      // Act
      const result = await processDivisionRequestUseCase.execute(requestWithoutMessage);

      // Assert
      expect(mockDivisionRequestRepository.update).toHaveBeenCalledWith(
        "request-123",
        expect.objectContaining({
          status: RequestStatus.APPROVED,
          adminMessage: undefined,
        })
      );
      expect(result).toEqual({
        request: approvedRequest,
        message: "Division request approved successfully",
      });
    });
  });
});
