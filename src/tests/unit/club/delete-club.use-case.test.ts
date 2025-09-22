import {
  DeleteClubUseCase,
  DeleteClubRequest,
} from "@/application/use-cases/club/delete-club.use-case";
import { IClubRepository } from "@/domain/repositories/club.repository";
import { Club } from "@/domain/entities/club.entity";
import AppException from "@/shared/utils/exception.util";
import { ROLE_NAMES } from "@/shared/constants";
import { createMockClubRepository, createMockClub } from "@/tests/test-helpers";

// Mock logger
jest.mock("@/infrastructure/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe("DeleteClubUseCase", () => {
  let deleteClubUseCase: DeleteClubUseCase;
  let mockClubRepository: jest.Mocked<IClubRepository>;

  const existingClub: Club = createMockClub({
    id: "club-123",
    name: "Video Games Club",
    description: "A club for video game enthusiasts",
    logoUrl: "https://example.com/logo.png",
  });

  const mockDeleteClubRequest: DeleteClubRequest = {
    id: "club-123",
    userRoles: [ROLE_NAMES.COMMITTEE],
  };

  beforeEach(() => {
    // Create mocks
    mockClubRepository = createMockClubRepository();

    // Create use case instance
    deleteClubUseCase = new DeleteClubUseCase(mockClubRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should delete a club successfully with committee role", async () => {
      // Arrange
      mockClubRepository.findById.mockResolvedValue(existingClub);
      mockClubRepository.delete.mockResolvedValue();

      // Act
      await deleteClubUseCase.execute(mockDeleteClubRequest);

      // Assert
      expect(mockClubRepository.findById).toHaveBeenCalledWith("club-123");
      expect(mockClubRepository.delete).toHaveBeenCalledWith("club-123");
    });

    it("should delete a club successfully with president role", async () => {
      // Arrange
      const requestWithPresidentRole: DeleteClubRequest = {
        ...mockDeleteClubRequest,
        userRoles: [ROLE_NAMES.PRESIDENT],
      };
      mockClubRepository.findById.mockResolvedValue(existingClub);
      mockClubRepository.delete.mockResolvedValue();

      // Act
      await deleteClubUseCase.execute(requestWithPresidentRole);

      // Assert
      expect(mockClubRepository.findById).toHaveBeenCalledWith("club-123");
      expect(mockClubRepository.delete).toHaveBeenCalledWith("club-123");
    });

    it("should throw AppException when user lacks permission", async () => {
      // Arrange
      const requestWithMemberRole: DeleteClubRequest = {
        ...mockDeleteClubRequest,
        userRoles: [ROLE_NAMES.MEMBER],
      };

      // Act & Assert
      await expect(
        deleteClubUseCase.execute(requestWithMemberRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only committee and president roles can delete clubs.",
          403
        )
      );
      expect(mockClubRepository.findById).not.toHaveBeenCalled();
      expect(mockClubRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw AppException when user has no roles", async () => {
      // Arrange
      const requestWithNoRoles: DeleteClubRequest = {
        ...mockDeleteClubRequest,
        userRoles: [],
      };

      // Act & Assert
      await expect(
        deleteClubUseCase.execute(requestWithNoRoles)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only committee and president roles can delete clubs.",
          403
        )
      );
      expect(mockClubRepository.findById).not.toHaveBeenCalled();
      expect(mockClubRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw AppException when club does not exist", async () => {
      // Arrange
      mockClubRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        deleteClubUseCase.execute(mockDeleteClubRequest)
      ).rejects.toThrow(
        new AppException("Club not found with ID: club-123", 404)
      );
      expect(mockClubRepository.findById).toHaveBeenCalledWith("club-123");
      expect(mockClubRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw AppException when repository findById fails", async () => {
      // Arrange
      const repositoryError = new Error("Database connection failed");
      mockClubRepository.findById.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(
        deleteClubUseCase.execute(mockDeleteClubRequest)
      ).rejects.toThrow(repositoryError);
      expect(mockClubRepository.findById).toHaveBeenCalledWith("club-123");
      expect(mockClubRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw AppException when repository delete fails", async () => {
      // Arrange
      const repositoryError = new Error("Database connection failed");
      mockClubRepository.findById.mockResolvedValue(existingClub);
      mockClubRepository.delete.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(
        deleteClubUseCase.execute(mockDeleteClubRequest)
      ).rejects.toThrow(repositoryError);
      expect(mockClubRepository.findById).toHaveBeenCalledWith("club-123");
      expect(mockClubRepository.delete).toHaveBeenCalledWith("club-123");
    });

    it("should work with multiple allowed roles", async () => {
      // Arrange
      const requestWithMultipleRoles: DeleteClubRequest = {
        ...mockDeleteClubRequest,
        userRoles: [ROLE_NAMES.MEMBER, ROLE_NAMES.COMMITTEE, ROLE_NAMES.LEADER],
      };
      mockClubRepository.findById.mockResolvedValue(existingClub);
      mockClubRepository.delete.mockResolvedValue();

      // Act
      await deleteClubUseCase.execute(requestWithMultipleRoles);

      // Assert
      expect(mockClubRepository.findById).toHaveBeenCalledWith("club-123");
      expect(mockClubRepository.delete).toHaveBeenCalledWith("club-123");
    });

    it("should work when user has both allowed and non-allowed roles", async () => {
      // Arrange
      const requestWithMixedRoles: DeleteClubRequest = {
        ...mockDeleteClubRequest,
        userRoles: [
          ROLE_NAMES.MEMBER,
          ROLE_NAMES.LEADER,
          ROLE_NAMES.PRESIDENT, // This should allow the operation
          ROLE_NAMES.CO_LEADER,
        ],
      };
      mockClubRepository.findById.mockResolvedValue(existingClub);
      mockClubRepository.delete.mockResolvedValue();

      // Act
      await deleteClubUseCase.execute(requestWithMixedRoles);

      // Assert
      expect(mockClubRepository.findById).toHaveBeenCalledWith("club-123");
      expect(mockClubRepository.delete).toHaveBeenCalledWith("club-123");
    });

    it("should handle invalid role strings gracefully", async () => {
      // Arrange
      const requestWithInvalidRoles: DeleteClubRequest = {
        ...mockDeleteClubRequest,
        userRoles: ["invalid-role", "another-invalid-role"],
      };

      // Act & Assert
      await expect(
        deleteClubUseCase.execute(requestWithInvalidRoles)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only committee and president roles can delete clubs.",
          403
        )
      );
      expect(mockClubRepository.findById).not.toHaveBeenCalled();
      expect(mockClubRepository.delete).not.toHaveBeenCalled();
    });
  });
});
