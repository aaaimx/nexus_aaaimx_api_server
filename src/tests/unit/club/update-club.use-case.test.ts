import {
  UpdateClubUseCase,
  UpdateClubRequest,
} from "@/application/use-cases/club/update-club.use-case";
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

describe("UpdateClubUseCase", () => {
  let updateClubUseCase: UpdateClubUseCase;
  let mockClubRepository: jest.Mocked<IClubRepository>;

  const existingClub: Club = createMockClub({
    id: "club-123",
    name: "Original Club",
    description: "Original description",
    logoUrl: "https://example.com/original-logo.png",
  });

  const mockUpdateClubRequest: UpdateClubRequest = {
    id: "club-123",
    name: "Updated Club",
    description: "Updated description",
    logoUrl: "https://example.com/updated-logo.png",
    userRoles: [ROLE_NAMES.COMMITTEE],
  };

  const updatedClub: Club = createMockClub({
    id: "club-123",
    name: "Updated Club",
    description: "Updated description",
    logoUrl: "https://example.com/updated-logo.png",
  });

  beforeEach(() => {
    // Create mocks
    mockClubRepository = createMockClubRepository();

    // Create use case instance
    updateClubUseCase = new UpdateClubUseCase(mockClubRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should update a club successfully with committee role", async () => {
      // Arrange
      mockClubRepository.findById.mockResolvedValue(existingClub);
      mockClubRepository.findByName.mockResolvedValue(null);
      mockClubRepository.update.mockResolvedValue(updatedClub);

      // Act
      const result = await updateClubUseCase.execute(mockUpdateClubRequest);

      // Assert
      expect(mockClubRepository.findById).toHaveBeenCalledWith("club-123");
      expect(mockClubRepository.findByName).toHaveBeenCalledWith(
        "Updated Club"
      );
      expect(mockClubRepository.update).toHaveBeenCalledWith("club-123", {
        name: "Updated Club",
        description: "Updated description",
        logoUrl: "https://example.com/updated-logo.png",
      });
      expect(result).toEqual({
        club: updatedClub,
      });
    });

    it("should update a club successfully with president role", async () => {
      // Arrange
      const requestWithPresidentRole: UpdateClubRequest = {
        ...mockUpdateClubRequest,
        userRoles: [ROLE_NAMES.PRESIDENT],
      };
      mockClubRepository.findById.mockResolvedValue(existingClub);
      mockClubRepository.findByName.mockResolvedValue(null);
      mockClubRepository.update.mockResolvedValue(updatedClub);

      // Act
      const result = await updateClubUseCase.execute(requestWithPresidentRole);

      // Assert
      expect(mockClubRepository.findById).toHaveBeenCalledWith("club-123");
      expect(mockClubRepository.findByName).toHaveBeenCalledWith(
        "Updated Club"
      );
      expect(mockClubRepository.update).toHaveBeenCalledWith("club-123", {
        name: "Updated Club",
        description: "Updated description",
        logoUrl: "https://example.com/updated-logo.png",
      });
      expect(result).toEqual({
        club: updatedClub,
      });
    });

    it("should update club with only some fields", async () => {
      // Arrange
      const partialUpdateRequest: UpdateClubRequest = {
        id: "club-123",
        name: "Updated Club Name Only",
        userRoles: [ROLE_NAMES.COMMITTEE],
      };
      const partiallyUpdatedClub = createMockClub({
        id: "club-123",
        name: "Updated Club Name Only",
        description: "Original description",
        logoUrl: "https://example.com/original-logo.png",
      });
      mockClubRepository.findById.mockResolvedValue(existingClub);
      mockClubRepository.findByName.mockResolvedValue(null);
      mockClubRepository.update.mockResolvedValue(partiallyUpdatedClub);

      // Act
      const result = await updateClubUseCase.execute(partialUpdateRequest);

      // Assert
      expect(mockClubRepository.update).toHaveBeenCalledWith("club-123", {
        name: "Updated Club Name Only",
      });
      expect(result).toEqual({
        club: partiallyUpdatedClub,
      });
    });

    it("should update club without changing name", async () => {
      // Arrange
      const requestWithoutNameChange: UpdateClubRequest = {
        id: "club-123",
        description: "New description only",
        logoUrl: "https://example.com/new-logo.png",
        userRoles: [ROLE_NAMES.COMMITTEE],
      };
      const clubWithUpdatedFieldsOnly = createMockClub({
        id: "club-123",
        name: "Original Club",
        description: "New description only",
        logoUrl: "https://example.com/new-logo.png",
      });
      mockClubRepository.findById.mockResolvedValue(existingClub);
      mockClubRepository.update.mockResolvedValue(clubWithUpdatedFieldsOnly);

      // Act
      const result = await updateClubUseCase.execute(requestWithoutNameChange);

      // Assert
      expect(mockClubRepository.findById).toHaveBeenCalledWith("club-123");
      expect(mockClubRepository.findByName).not.toHaveBeenCalled();
      expect(mockClubRepository.update).toHaveBeenCalledWith("club-123", {
        description: "New description only",
        logoUrl: "https://example.com/new-logo.png",
      });
      expect(result).toEqual({
        club: clubWithUpdatedFieldsOnly,
      });
    });

    it("should allow updating to the same name", async () => {
      // Arrange
      const requestWithSameName: UpdateClubRequest = {
        id: "club-123",
        name: "Original Club", // Same as existing name
        description: "Updated description",
        userRoles: [ROLE_NAMES.COMMITTEE],
      };
      const clubWithSameName = createMockClub({
        id: "club-123",
        name: "Original Club",
        description: "Updated description",
      });
      mockClubRepository.findById.mockResolvedValue(existingClub);
      mockClubRepository.update.mockResolvedValue(clubWithSameName);

      // Act
      const result = await updateClubUseCase.execute(requestWithSameName);

      // Assert
      expect(mockClubRepository.findById).toHaveBeenCalledWith("club-123");
      expect(mockClubRepository.findByName).not.toHaveBeenCalled();
      expect(mockClubRepository.update).toHaveBeenCalledWith("club-123", {
        name: "Original Club",
        description: "Updated description",
      });
      expect(result).toEqual({
        club: clubWithSameName,
      });
    });

    it("should throw AppException when user lacks permission", async () => {
      // Arrange
      const requestWithMemberRole: UpdateClubRequest = {
        ...mockUpdateClubRequest,
        userRoles: [ROLE_NAMES.MEMBER],
      };

      // Act & Assert
      await expect(
        updateClubUseCase.execute(requestWithMemberRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only committee and president roles can update clubs.",
          403
        )
      );
      expect(mockClubRepository.findById).not.toHaveBeenCalled();
      expect(mockClubRepository.update).not.toHaveBeenCalled();
    });

    it("should throw AppException when club does not exist", async () => {
      // Arrange
      mockClubRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        updateClubUseCase.execute(mockUpdateClubRequest)
      ).rejects.toThrow(
        new AppException("Club not found with ID: club-123", 404)
      );
      expect(mockClubRepository.findById).toHaveBeenCalledWith("club-123");
      expect(mockClubRepository.update).not.toHaveBeenCalled();
    });

    it("should throw AppException when new name already exists for another club", async () => {
      // Arrange
      const anotherClub = createMockClub({
        id: "club-456",
        name: "Updated Club",
      });
      mockClubRepository.findById.mockResolvedValue(existingClub);
      mockClubRepository.findByName.mockResolvedValue(anotherClub);

      // Act & Assert
      await expect(
        updateClubUseCase.execute(mockUpdateClubRequest)
      ).rejects.toThrow(
        new AppException("Club with this name already exists", 400)
      );
      expect(mockClubRepository.findById).toHaveBeenCalledWith("club-123");
      expect(mockClubRepository.findByName).toHaveBeenCalledWith(
        "Updated Club"
      );
      expect(mockClubRepository.update).not.toHaveBeenCalled();
    });

    it("should throw AppException when repository update fails", async () => {
      // Arrange
      const repositoryError = new Error("Database connection failed");
      mockClubRepository.findById.mockResolvedValue(existingClub);
      mockClubRepository.findByName.mockResolvedValue(null);
      mockClubRepository.update.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(
        updateClubUseCase.execute(mockUpdateClubRequest)
      ).rejects.toThrow(repositoryError);
      expect(mockClubRepository.findById).toHaveBeenCalledWith("club-123");
      expect(mockClubRepository.update).toHaveBeenCalledWith("club-123", {
        name: "Updated Club",
        description: "Updated description",
        logoUrl: "https://example.com/updated-logo.png",
      });
    });

    it("should handle undefined fields correctly", async () => {
      // Arrange
      const requestWithUndefinedFields: UpdateClubRequest = {
        id: "club-123",
        name: undefined,
        description: undefined,
        logoUrl: undefined,
        userRoles: [ROLE_NAMES.COMMITTEE],
      };
      mockClubRepository.findById.mockResolvedValue(existingClub);
      mockClubRepository.update.mockResolvedValue(existingClub);

      // Act
      const result = await updateClubUseCase.execute(
        requestWithUndefinedFields
      );

      // Assert
      expect(mockClubRepository.update).toHaveBeenCalledWith("club-123", {});
      expect(result).toEqual({
        club: existingClub,
      });
    });

    it("should work with multiple allowed roles", async () => {
      // Arrange
      const requestWithMultipleRoles: UpdateClubRequest = {
        ...mockUpdateClubRequest,
        userRoles: [ROLE_NAMES.MEMBER, ROLE_NAMES.COMMITTEE, ROLE_NAMES.LEADER],
      };
      mockClubRepository.findById.mockResolvedValue(existingClub);
      mockClubRepository.findByName.mockResolvedValue(null);
      mockClubRepository.update.mockResolvedValue(updatedClub);

      // Act
      const result = await updateClubUseCase.execute(requestWithMultipleRoles);

      // Assert
      expect(result).toEqual({
        club: updatedClub,
      });
    });
  });
});
