import {
  UpdateDivisionUseCase,
  UpdateDivisionRequest,
} from "@/application/use-cases/division/update-division.use-case";
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

describe("UpdateDivisionUseCase", () => {
  let updateDivisionUseCase: UpdateDivisionUseCase;
  let mockDivisionRepository: jest.Mocked<IDivisionRepository>;

  const existingDivision: Division = createMockDivision({
    id: "division-123",
    name: "Original Division",
    description: "Original description",
    logoUrl: "https://example.com/original-logo.png",
  });

  const mockUpdateDivisionRequest: UpdateDivisionRequest = {
    id: "division-123",
    name: "Updated Division",
    description: "Updated description",
    logoUrl: "https://example.com/updated-logo.png",
    userRoles: [ROLE_NAMES.COMMITTEE],
  };

  const updatedDivision: Division = createMockDivision({
    id: "division-123",
    name: "Updated Division",
    description: "Updated description",
    logoUrl: "https://example.com/updated-logo.png",
  });

  beforeEach(() => {
    // Create mocks
    mockDivisionRepository = createMockDivisionRepository();

    // Create use case instance
    updateDivisionUseCase = new UpdateDivisionUseCase(mockDivisionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should update a division successfully with committee role", async () => {
      // Arrange
      mockDivisionRepository.findById.mockResolvedValue(existingDivision);
      mockDivisionRepository.findByName.mockResolvedValue(null);
      mockDivisionRepository.update.mockResolvedValue(updatedDivision);

      // Act
      const result = await updateDivisionUseCase.execute(
        mockUpdateDivisionRequest
      );

      // Assert
      expect(mockDivisionRepository.findById).toHaveBeenCalledWith(
        "division-123"
      );
      expect(mockDivisionRepository.findByName).toHaveBeenCalledWith(
        "Updated Division"
      );
      expect(mockDivisionRepository.update).toHaveBeenCalledWith(
        "division-123",
        {
          name: "Updated Division",
          description: "Updated description",
          logoUrl: "https://example.com/updated-logo.png",
        }
      );
      expect(result).toEqual({
        division: updatedDivision,
      });
    });

    it("should update a division successfully with president role", async () => {
      // Arrange
      const requestWithPresidentRole: UpdateDivisionRequest = {
        ...mockUpdateDivisionRequest,
        userRoles: [ROLE_NAMES.PRESIDENT],
      };
      mockDivisionRepository.findById.mockResolvedValue(existingDivision);
      mockDivisionRepository.findByName.mockResolvedValue(null);
      mockDivisionRepository.update.mockResolvedValue(updatedDivision);

      // Act
      const result = await updateDivisionUseCase.execute(
        requestWithPresidentRole
      );

      // Assert
      expect(mockDivisionRepository.findById).toHaveBeenCalledWith(
        "division-123"
      );
      expect(mockDivisionRepository.findByName).toHaveBeenCalledWith(
        "Updated Division"
      );
      expect(mockDivisionRepository.update).toHaveBeenCalledWith(
        "division-123",
        {
          name: "Updated Division",
          description: "Updated description",
          logoUrl: "https://example.com/updated-logo.png",
        }
      );
      expect(result).toEqual({
        division: updatedDivision,
      });
    });

    it("should update division with only some fields", async () => {
      // Arrange
      const partialUpdateRequest: UpdateDivisionRequest = {
        id: "division-123",
        name: "Updated Division Name Only",
        userRoles: [ROLE_NAMES.COMMITTEE],
      };
      const partiallyUpdatedDivision = createMockDivision({
        id: "division-123",
        name: "Updated Division Name Only",
        description: "Original description",
        logoUrl: "https://example.com/original-logo.png",
      });
      mockDivisionRepository.findById.mockResolvedValue(existingDivision);
      mockDivisionRepository.findByName.mockResolvedValue(null);
      mockDivisionRepository.update.mockResolvedValue(partiallyUpdatedDivision);

      // Act
      const result = await updateDivisionUseCase.execute(partialUpdateRequest);

      // Assert
      expect(mockDivisionRepository.update).toHaveBeenCalledWith(
        "division-123",
        {
          name: "Updated Division Name Only",
        }
      );
      expect(result).toEqual({
        division: partiallyUpdatedDivision,
      });
    });

    it("should update division without changing name", async () => {
      // Arrange
      const requestWithoutNameChange: UpdateDivisionRequest = {
        id: "division-123",
        description: "New description only",
        logoUrl: "https://example.com/new-logo.png",
        userRoles: [ROLE_NAMES.COMMITTEE],
      };
      const divisionWithUpdatedFieldsOnly = createMockDivision({
        id: "division-123",
        name: "Original Division",
        description: "New description only",
        logoUrl: "https://example.com/new-logo.png",
      });
      mockDivisionRepository.findById.mockResolvedValue(existingDivision);
      mockDivisionRepository.update.mockResolvedValue(
        divisionWithUpdatedFieldsOnly
      );

      // Act
      const result = await updateDivisionUseCase.execute(
        requestWithoutNameChange
      );

      // Assert
      expect(mockDivisionRepository.findById).toHaveBeenCalledWith(
        "division-123"
      );
      expect(mockDivisionRepository.findByName).not.toHaveBeenCalled();
      expect(mockDivisionRepository.update).toHaveBeenCalledWith(
        "division-123",
        {
          description: "New description only",
          logoUrl: "https://example.com/new-logo.png",
        }
      );
      expect(result).toEqual({
        division: divisionWithUpdatedFieldsOnly,
      });
    });

    it("should allow updating to the same name", async () => {
      // Arrange
      const requestWithSameName: UpdateDivisionRequest = {
        id: "division-123",
        name: "Original Division", // Same as existing name
        description: "Updated description",
        userRoles: [ROLE_NAMES.COMMITTEE],
      };
      const divisionWithSameName = createMockDivision({
        id: "division-123",
        name: "Original Division",
        description: "Updated description",
      });
      mockDivisionRepository.findById.mockResolvedValue(existingDivision);
      mockDivisionRepository.update.mockResolvedValue(divisionWithSameName);

      // Act
      const result = await updateDivisionUseCase.execute(requestWithSameName);

      // Assert
      expect(mockDivisionRepository.findById).toHaveBeenCalledWith(
        "division-123"
      );
      expect(mockDivisionRepository.findByName).not.toHaveBeenCalled();
      expect(mockDivisionRepository.update).toHaveBeenCalledWith(
        "division-123",
        {
          name: "Original Division",
          description: "Updated description",
        }
      );
      expect(result).toEqual({
        division: divisionWithSameName,
      });
    });

    it("should throw AppException when user lacks permission", async () => {
      // Arrange
      const requestWithMemberRole: UpdateDivisionRequest = {
        ...mockUpdateDivisionRequest,
        userRoles: [ROLE_NAMES.MEMBER],
      };

      // Act & Assert
      await expect(
        updateDivisionUseCase.execute(requestWithMemberRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only committee and president roles can update divisions.",
          403
        )
      );
      expect(mockDivisionRepository.findById).not.toHaveBeenCalled();
      expect(mockDivisionRepository.update).not.toHaveBeenCalled();
    });

    it("should throw AppException when division does not exist", async () => {
      // Arrange
      mockDivisionRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        updateDivisionUseCase.execute(mockUpdateDivisionRequest)
      ).rejects.toThrow(
        new AppException("Division not found with ID: division-123", 404)
      );
      expect(mockDivisionRepository.findById).toHaveBeenCalledWith(
        "division-123"
      );
      expect(mockDivisionRepository.update).not.toHaveBeenCalled();
    });

    it("should throw AppException when new name already exists for another division", async () => {
      // Arrange
      const anotherDivision = createMockDivision({
        id: "division-456",
        name: "Updated Division",
      });
      mockDivisionRepository.findById.mockResolvedValue(existingDivision);
      mockDivisionRepository.findByName.mockResolvedValue(anotherDivision);

      // Act & Assert
      await expect(
        updateDivisionUseCase.execute(mockUpdateDivisionRequest)
      ).rejects.toThrow(
        new AppException("Division with this name already exists", 400)
      );
      expect(mockDivisionRepository.findById).toHaveBeenCalledWith(
        "division-123"
      );
      expect(mockDivisionRepository.findByName).toHaveBeenCalledWith(
        "Updated Division"
      );
      expect(mockDivisionRepository.update).not.toHaveBeenCalled();
    });

    it("should throw AppException when repository update fails", async () => {
      // Arrange
      const repositoryError = new Error("Database connection failed");
      mockDivisionRepository.findById.mockResolvedValue(existingDivision);
      mockDivisionRepository.findByName.mockResolvedValue(null);
      mockDivisionRepository.update.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(
        updateDivisionUseCase.execute(mockUpdateDivisionRequest)
      ).rejects.toThrow(repositoryError);
      expect(mockDivisionRepository.findById).toHaveBeenCalledWith(
        "division-123"
      );
      expect(mockDivisionRepository.update).toHaveBeenCalledWith(
        "division-123",
        {
          name: "Updated Division",
          description: "Updated description",
          logoUrl: "https://example.com/updated-logo.png",
        }
      );
    });

    it("should handle undefined fields correctly", async () => {
      // Arrange
      const requestWithUndefinedFields: UpdateDivisionRequest = {
        id: "division-123",
        name: undefined,
        description: undefined,
        logoUrl: undefined,
        userRoles: [ROLE_NAMES.COMMITTEE],
      };
      mockDivisionRepository.findById.mockResolvedValue(existingDivision);
      mockDivisionRepository.update.mockResolvedValue(existingDivision);

      // Act
      const result = await updateDivisionUseCase.execute(
        requestWithUndefinedFields
      );

      // Assert
      expect(mockDivisionRepository.update).toHaveBeenCalledWith(
        "division-123",
        {}
      );
      expect(result).toEqual({
        division: existingDivision,
      });
    });

    it("should work with multiple allowed roles", async () => {
      // Arrange
      const requestWithMultipleRoles: UpdateDivisionRequest = {
        ...mockUpdateDivisionRequest,
        userRoles: [ROLE_NAMES.MEMBER, ROLE_NAMES.COMMITTEE, ROLE_NAMES.LEADER],
      };
      mockDivisionRepository.findById.mockResolvedValue(existingDivision);
      mockDivisionRepository.findByName.mockResolvedValue(null);
      mockDivisionRepository.update.mockResolvedValue(updatedDivision);

      // Act
      const result = await updateDivisionUseCase.execute(
        requestWithMultipleRoles
      );

      // Assert
      expect(result).toEqual({
        division: updatedDivision,
      });
    });

    it("should handle leader role as insufficient permission", async () => {
      // Arrange
      const requestWithLeaderRole: UpdateDivisionRequest = {
        ...mockUpdateDivisionRequest,
        userRoles: [ROLE_NAMES.LEADER],
      };

      // Act & Assert
      await expect(
        updateDivisionUseCase.execute(requestWithLeaderRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only committee and president roles can update divisions.",
          403
        )
      );
      expect(mockDivisionRepository.findById).not.toHaveBeenCalled();
      expect(mockDivisionRepository.update).not.toHaveBeenCalled();
    });
  });
});
