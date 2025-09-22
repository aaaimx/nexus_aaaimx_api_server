import {
  CreateDivisionUseCase,
  CreateDivisionRequest,
} from "@/application/use-cases/division/create-division.use-case";
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

describe("CreateDivisionUseCase", () => {
  let createDivisionUseCase: CreateDivisionUseCase;
  let mockDivisionRepository: jest.Mocked<IDivisionRepository>;

  const mockCreateDivisionRequest: CreateDivisionRequest = {
    name: "Software Development",
    description: "Division focused on software development projects",
    logoUrl: "https://example.com/software-logo.png",
    userRoles: [ROLE_NAMES.COMMITTEE],
  };

  const mockCreatedDivision: Division = createMockDivision({
    id: "division-123",
    name: "Software Development",
    description: "Division focused on software development projects",
    logoUrl: "https://example.com/software-logo.png",
  });

  beforeEach(() => {
    // Create mocks
    mockDivisionRepository = createMockDivisionRepository();

    // Create use case instance
    createDivisionUseCase = new CreateDivisionUseCase(mockDivisionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should create a division successfully with committee role", async () => {
      // Arrange
      mockDivisionRepository.findByName.mockResolvedValue(null);
      mockDivisionRepository.create.mockResolvedValue(mockCreatedDivision);

      // Act
      const result = await createDivisionUseCase.execute(
        mockCreateDivisionRequest
      );

      // Assert
      expect(mockDivisionRepository.findByName).toHaveBeenCalledWith(
        "Software Development"
      );
      expect(mockDivisionRepository.create).toHaveBeenCalledWith({
        name: "Software Development",
        description: "Division focused on software development projects",
        logoUrl: "https://example.com/software-logo.png",
      });
      expect(result).toEqual({
        division: mockCreatedDivision,
      });
    });

    it("should create a division successfully with president role", async () => {
      // Arrange
      const requestWithPresidentRole: CreateDivisionRequest = {
        ...mockCreateDivisionRequest,
        userRoles: [ROLE_NAMES.PRESIDENT],
      };
      mockDivisionRepository.findByName.mockResolvedValue(null);
      mockDivisionRepository.create.mockResolvedValue(mockCreatedDivision);

      // Act
      const result = await createDivisionUseCase.execute(
        requestWithPresidentRole
      );

      // Assert
      expect(mockDivisionRepository.findByName).toHaveBeenCalledWith(
        "Software Development"
      );
      expect(mockDivisionRepository.create).toHaveBeenCalledWith({
        name: "Software Development",
        description: "Division focused on software development projects",
        logoUrl: "https://example.com/software-logo.png",
      });
      expect(result).toEqual({
        division: mockCreatedDivision,
      });
    });

    it("should create a division successfully with only required fields", async () => {
      // Arrange
      const minimalRequest: CreateDivisionRequest = {
        name: "Minimal Division",
        userRoles: [ROLE_NAMES.COMMITTEE],
      };
      const minimalDivision = createMockDivision({
        id: "division-456",
        name: "Minimal Division",
        description: undefined,
        logoUrl: undefined,
      });
      mockDivisionRepository.findByName.mockResolvedValue(null);
      mockDivisionRepository.create.mockResolvedValue(minimalDivision);

      // Act
      const result = await createDivisionUseCase.execute(minimalRequest);

      // Assert
      expect(mockDivisionRepository.findByName).toHaveBeenCalledWith(
        "Minimal Division"
      );
      expect(mockDivisionRepository.create).toHaveBeenCalledWith({
        name: "Minimal Division",
      });
      expect(result).toEqual({
        division: minimalDivision,
      });
    });

    it("should throw AppException when user lacks permission", async () => {
      // Arrange
      const requestWithMemberRole: CreateDivisionRequest = {
        ...mockCreateDivisionRequest,
        userRoles: [ROLE_NAMES.MEMBER],
      };

      // Act & Assert
      await expect(
        createDivisionUseCase.execute(requestWithMemberRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only committee and president roles can create divisions.",
          403
        )
      );
      expect(mockDivisionRepository.findByName).not.toHaveBeenCalled();
      expect(mockDivisionRepository.create).not.toHaveBeenCalled();
    });

    it("should throw AppException when user has no roles", async () => {
      // Arrange
      const requestWithNoRoles: CreateDivisionRequest = {
        ...mockCreateDivisionRequest,
        userRoles: [],
      };

      // Act & Assert
      await expect(
        createDivisionUseCase.execute(requestWithNoRoles)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only committee and president roles can create divisions.",
          403
        )
      );
      expect(mockDivisionRepository.findByName).not.toHaveBeenCalled();
      expect(mockDivisionRepository.create).not.toHaveBeenCalled();
    });

    it("should throw AppException when division name already exists", async () => {
      // Arrange
      const existingDivision = createMockDivision({
        name: "Software Development",
      });
      mockDivisionRepository.findByName.mockResolvedValue(existingDivision);

      // Act & Assert
      await expect(
        createDivisionUseCase.execute(mockCreateDivisionRequest)
      ).rejects.toThrow(
        new AppException("Division with this name already exists", 400)
      );
      expect(mockDivisionRepository.findByName).toHaveBeenCalledWith(
        "Software Development"
      );
      expect(mockDivisionRepository.create).not.toHaveBeenCalled();
    });

    it("should throw AppException when repository create fails", async () => {
      // Arrange
      const repositoryError = new Error("Database connection failed");
      mockDivisionRepository.findByName.mockResolvedValue(null);
      mockDivisionRepository.create.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(
        createDivisionUseCase.execute(mockCreateDivisionRequest)
      ).rejects.toThrow(repositoryError);
      expect(mockDivisionRepository.findByName).toHaveBeenCalledWith(
        "Software Development"
      );
      expect(mockDivisionRepository.create).toHaveBeenCalledWith({
        name: "Software Development",
        description: "Division focused on software development projects",
        logoUrl: "https://example.com/software-logo.png",
      });
    });

    it("should throw AppException when findByName fails", async () => {
      // Arrange
      const repositoryError = new Error("Database connection failed");
      mockDivisionRepository.findByName.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(
        createDivisionUseCase.execute(mockCreateDivisionRequest)
      ).rejects.toThrow(repositoryError);
      expect(mockDivisionRepository.findByName).toHaveBeenCalledWith(
        "Software Development"
      );
      expect(mockDivisionRepository.create).not.toHaveBeenCalled();
    });

    it("should work with multiple allowed roles", async () => {
      // Arrange
      const requestWithMultipleRoles: CreateDivisionRequest = {
        ...mockCreateDivisionRequest,
        userRoles: [ROLE_NAMES.MEMBER, ROLE_NAMES.COMMITTEE, ROLE_NAMES.LEADER],
      };
      mockDivisionRepository.findByName.mockResolvedValue(null);
      mockDivisionRepository.create.mockResolvedValue(mockCreatedDivision);

      // Act
      const result = await createDivisionUseCase.execute(
        requestWithMultipleRoles
      );

      // Assert
      expect(result).toEqual({
        division: mockCreatedDivision,
      });
    });

    it("should handle undefined description and logoUrl correctly", async () => {
      // Arrange
      const requestWithUndefinedFields: CreateDivisionRequest = {
        name: "Test Division",
        description: undefined,
        logoUrl: undefined,
        userRoles: [ROLE_NAMES.COMMITTEE],
      };
      const divisionWithUndefinedFields = createMockDivision({
        name: "Test Division",
        description: undefined,
        logoUrl: undefined,
      });
      mockDivisionRepository.findByName.mockResolvedValue(null);
      mockDivisionRepository.create.mockResolvedValue(
        divisionWithUndefinedFields
      );

      // Act
      const result = await createDivisionUseCase.execute(
        requestWithUndefinedFields
      );

      // Assert
      expect(mockDivisionRepository.create).toHaveBeenCalledWith({
        name: "Test Division",
      });
      expect(result).toEqual({
        division: divisionWithUndefinedFields,
      });
    });

    it("should handle leader role as insufficient permission", async () => {
      // Arrange
      const requestWithLeaderRole: CreateDivisionRequest = {
        ...mockCreateDivisionRequest,
        userRoles: [ROLE_NAMES.LEADER],
      };

      // Act & Assert
      await expect(
        createDivisionUseCase.execute(requestWithLeaderRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only committee and president roles can create divisions.",
          403
        )
      );
      expect(mockDivisionRepository.findByName).not.toHaveBeenCalled();
      expect(mockDivisionRepository.create).not.toHaveBeenCalled();
    });

    it("should handle co-leader role as insufficient permission", async () => {
      // Arrange
      const requestWithCoLeaderRole: CreateDivisionRequest = {
        ...mockCreateDivisionRequest,
        userRoles: [ROLE_NAMES.CO_LEADER],
      };

      // Act & Assert
      await expect(
        createDivisionUseCase.execute(requestWithCoLeaderRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only committee and president roles can create divisions.",
          403
        )
      );
      expect(mockDivisionRepository.findByName).not.toHaveBeenCalled();
      expect(mockDivisionRepository.create).not.toHaveBeenCalled();
    });
  });
});
