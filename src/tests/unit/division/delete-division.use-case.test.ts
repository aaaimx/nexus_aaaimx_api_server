import {
  DeleteDivisionUseCase,
  DeleteDivisionRequest,
} from "@/application/use-cases/division/delete-division.use-case";
import { IDivisionRepository } from "@/domain/repositories/division.repository";
import { Division } from "@/domain/entities/division.entity";
import AppException from "@/shared/utils/exception.util";
import { ROLE_NAMES } from "@/shared/constants";
import {
  createMockDivisionRepository,
  createMockDivision,
} from "@/tests/test-helpers";

// Mock logger
jest.mock("@/infrastructure/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe("DeleteDivisionUseCase", () => {
  let deleteDivisionUseCase: DeleteDivisionUseCase;
  let mockDivisionRepository: jest.Mocked<IDivisionRepository>;

  const existingDivision: Division = createMockDivision({
    id: "division-123",
    name: "Software Development",
    description: "Division focused on software development projects",
    logoUrl: "https://example.com/software-logo.png",
  });

  const mockDeleteDivisionRequest: DeleteDivisionRequest = {
    id: "division-123",
    userRoles: [ROLE_NAMES.COMMITTEE],
  };

  beforeEach(() => {
    // Create mocks
    mockDivisionRepository = createMockDivisionRepository();

    // Create use case instance
    deleteDivisionUseCase = new DeleteDivisionUseCase(mockDivisionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should delete a division successfully with committee role", async () => {
      // Arrange
      mockDivisionRepository.findById.mockResolvedValue(existingDivision);
      mockDivisionRepository.delete.mockResolvedValue();

      // Act
      await deleteDivisionUseCase.execute(mockDeleteDivisionRequest);

      // Assert
      expect(mockDivisionRepository.findById).toHaveBeenCalledWith(
        "division-123"
      );
      expect(mockDivisionRepository.delete).toHaveBeenCalledWith(
        "division-123"
      );
    });

    it("should delete a division successfully with president role", async () => {
      // Arrange
      const requestWithPresidentRole: DeleteDivisionRequest = {
        ...mockDeleteDivisionRequest,
        userRoles: [ROLE_NAMES.PRESIDENT],
      };
      mockDivisionRepository.findById.mockResolvedValue(existingDivision);
      mockDivisionRepository.delete.mockResolvedValue();

      // Act
      await deleteDivisionUseCase.execute(requestWithPresidentRole);

      // Assert
      expect(mockDivisionRepository.findById).toHaveBeenCalledWith(
        "division-123"
      );
      expect(mockDivisionRepository.delete).toHaveBeenCalledWith(
        "division-123"
      );
    });

    it("should throw AppException when user lacks permission", async () => {
      // Arrange
      const requestWithMemberRole: DeleteDivisionRequest = {
        ...mockDeleteDivisionRequest,
        userRoles: [ROLE_NAMES.MEMBER],
      };

      // Act & Assert
      await expect(
        deleteDivisionUseCase.execute(requestWithMemberRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only committee and president roles can delete divisions.",
          403
        )
      );
      expect(mockDivisionRepository.findById).not.toHaveBeenCalled();
      expect(mockDivisionRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw AppException when user has no roles", async () => {
      // Arrange
      const requestWithNoRoles: DeleteDivisionRequest = {
        ...mockDeleteDivisionRequest,
        userRoles: [],
      };

      // Act & Assert
      await expect(
        deleteDivisionUseCase.execute(requestWithNoRoles)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only committee and president roles can delete divisions.",
          403
        )
      );
      expect(mockDivisionRepository.findById).not.toHaveBeenCalled();
      expect(mockDivisionRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw AppException when division does not exist", async () => {
      // Arrange
      mockDivisionRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        deleteDivisionUseCase.execute(mockDeleteDivisionRequest)
      ).rejects.toThrow(
        new AppException("Division not found with ID: division-123", 404)
      );
      expect(mockDivisionRepository.findById).toHaveBeenCalledWith(
        "division-123"
      );
      expect(mockDivisionRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw AppException when repository findById fails", async () => {
      // Arrange
      const repositoryError = new Error("Database connection failed");
      mockDivisionRepository.findById.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(
        deleteDivisionUseCase.execute(mockDeleteDivisionRequest)
      ).rejects.toThrow(repositoryError);
      expect(mockDivisionRepository.findById).toHaveBeenCalledWith(
        "division-123"
      );
      expect(mockDivisionRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw AppException when repository delete fails", async () => {
      // Arrange
      const repositoryError = new Error("Database connection failed");
      mockDivisionRepository.findById.mockResolvedValue(existingDivision);
      mockDivisionRepository.delete.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(
        deleteDivisionUseCase.execute(mockDeleteDivisionRequest)
      ).rejects.toThrow(repositoryError);
      expect(mockDivisionRepository.findById).toHaveBeenCalledWith(
        "division-123"
      );
      expect(mockDivisionRepository.delete).toHaveBeenCalledWith(
        "division-123"
      );
    });

    it("should work with multiple allowed roles", async () => {
      // Arrange
      const requestWithMultipleRoles: DeleteDivisionRequest = {
        ...mockDeleteDivisionRequest,
        userRoles: [ROLE_NAMES.MEMBER, ROLE_NAMES.COMMITTEE, ROLE_NAMES.LEADER],
      };
      mockDivisionRepository.findById.mockResolvedValue(existingDivision);
      mockDivisionRepository.delete.mockResolvedValue();

      // Act
      await deleteDivisionUseCase.execute(requestWithMultipleRoles);

      // Assert
      expect(mockDivisionRepository.findById).toHaveBeenCalledWith(
        "division-123"
      );
      expect(mockDivisionRepository.delete).toHaveBeenCalledWith(
        "division-123"
      );
    });

    it("should work when user has both allowed and non-allowed roles", async () => {
      // Arrange
      const requestWithMixedRoles: DeleteDivisionRequest = {
        ...mockDeleteDivisionRequest,
        userRoles: [
          ROLE_NAMES.MEMBER,
          ROLE_NAMES.LEADER,
          ROLE_NAMES.PRESIDENT, // This should allow the operation
          ROLE_NAMES.CO_LEADER,
        ],
      };
      mockDivisionRepository.findById.mockResolvedValue(existingDivision);
      mockDivisionRepository.delete.mockResolvedValue();

      // Act
      await deleteDivisionUseCase.execute(requestWithMixedRoles);

      // Assert
      expect(mockDivisionRepository.findById).toHaveBeenCalledWith(
        "division-123"
      );
      expect(mockDivisionRepository.delete).toHaveBeenCalledWith(
        "division-123"
      );
    });

    it("should handle invalid role strings gracefully", async () => {
      // Arrange
      const requestWithInvalidRoles: DeleteDivisionRequest = {
        ...mockDeleteDivisionRequest,
        userRoles: ["invalid-role", "another-invalid-role"],
      };

      // Act & Assert
      await expect(
        deleteDivisionUseCase.execute(requestWithInvalidRoles)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only committee and president roles can delete divisions.",
          403
        )
      );
      expect(mockDivisionRepository.findById).not.toHaveBeenCalled();
      expect(mockDivisionRepository.delete).not.toHaveBeenCalled();
    });

    it("should handle leader role as insufficient permission", async () => {
      // Arrange
      const requestWithLeaderRole: DeleteDivisionRequest = {
        ...mockDeleteDivisionRequest,
        userRoles: [ROLE_NAMES.LEADER],
      };

      // Act & Assert
      await expect(
        deleteDivisionUseCase.execute(requestWithLeaderRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only committee and president roles can delete divisions.",
          403
        )
      );
      expect(mockDivisionRepository.findById).not.toHaveBeenCalled();
      expect(mockDivisionRepository.delete).not.toHaveBeenCalled();
    });

    it("should handle co-leader role as insufficient permission", async () => {
      // Arrange
      const requestWithCoLeaderRole: DeleteDivisionRequest = {
        ...mockDeleteDivisionRequest,
        userRoles: [ROLE_NAMES.CO_LEADER],
      };

      // Act & Assert
      await expect(
        deleteDivisionUseCase.execute(requestWithCoLeaderRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only committee and president roles can delete divisions.",
          403
        )
      );
      expect(mockDivisionRepository.findById).not.toHaveBeenCalled();
      expect(mockDivisionRepository.delete).not.toHaveBeenCalled();
    });

    it("should handle senior member role as insufficient permission", async () => {
      // Arrange
      const requestWithSeniorMemberRole: DeleteDivisionRequest = {
        ...mockDeleteDivisionRequest,
        userRoles: [ROLE_NAMES.SENIOR_MEMBER],
      };

      // Act & Assert
      await expect(
        deleteDivisionUseCase.execute(requestWithSeniorMemberRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only committee and president roles can delete divisions.",
          403
        )
      );
      expect(mockDivisionRepository.findById).not.toHaveBeenCalled();
      expect(mockDivisionRepository.delete).not.toHaveBeenCalled();
    });
  });
});
