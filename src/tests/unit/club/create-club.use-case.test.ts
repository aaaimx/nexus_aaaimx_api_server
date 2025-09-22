import {
  CreateClubUseCase,
  CreateClubRequest,
} from "@/application/use-cases/club/create-club.use-case";
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

describe("CreateClubUseCase", () => {
  let createClubUseCase: CreateClubUseCase;
  let mockClubRepository: jest.Mocked<IClubRepository>;

  const mockCreateClubRequest: CreateClubRequest = {
    name: "Video Games Club",
    description: "A club for video game enthusiasts",
    logoUrl: "https://example.com/logo.png",
    userRoles: [ROLE_NAMES.COMMITTEE],
  };

  const mockCreatedClub: Club = createMockClub({
    id: "club-123",
    name: "Video Games Club",
    description: "A club for video game enthusiasts",
    logoUrl: "https://example.com/logo.png",
  });

  beforeEach(() => {
    // Create mocks
    mockClubRepository = createMockClubRepository();

    // Create use case instance
    createClubUseCase = new CreateClubUseCase(mockClubRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should create a club successfully with committee role", async () => {
      // Arrange
      mockClubRepository.findByName.mockResolvedValue(null);
      mockClubRepository.create.mockResolvedValue(mockCreatedClub);

      // Act
      const result = await createClubUseCase.execute(mockCreateClubRequest);

      // Assert
      expect(mockClubRepository.findByName).toHaveBeenCalledWith(
        "Video Games Club"
      );
      expect(mockClubRepository.create).toHaveBeenCalledWith({
        name: "Video Games Club",
        description: "A club for video game enthusiasts",
        logoUrl: "https://example.com/logo.png",
      });
      expect(result).toEqual({
        club: mockCreatedClub,
      });
    });

    it("should create a club successfully with president role", async () => {
      // Arrange
      const requestWithPresidentRole: CreateClubRequest = {
        ...mockCreateClubRequest,
        userRoles: [ROLE_NAMES.PRESIDENT],
      };
      mockClubRepository.findByName.mockResolvedValue(null);
      mockClubRepository.create.mockResolvedValue(mockCreatedClub);

      // Act
      const result = await createClubUseCase.execute(requestWithPresidentRole);

      // Assert
      expect(mockClubRepository.findByName).toHaveBeenCalledWith(
        "Video Games Club"
      );
      expect(mockClubRepository.create).toHaveBeenCalledWith({
        name: "Video Games Club",
        description: "A club for video game enthusiasts",
        logoUrl: "https://example.com/logo.png",
      });
      expect(result).toEqual({
        club: mockCreatedClub,
      });
    });

    it("should create a club successfully with only required fields", async () => {
      // Arrange
      const minimalRequest: CreateClubRequest = {
        name: "Minimal Club",
        userRoles: [ROLE_NAMES.COMMITTEE],
      };
      const minimalClub = createMockClub({
        id: "club-456",
        name: "Minimal Club",
        description: undefined,
        logoUrl: undefined,
      });
      mockClubRepository.findByName.mockResolvedValue(null);
      mockClubRepository.create.mockResolvedValue(minimalClub);

      // Act
      const result = await createClubUseCase.execute(minimalRequest);

      // Assert
      expect(mockClubRepository.findByName).toHaveBeenCalledWith(
        "Minimal Club"
      );
      expect(mockClubRepository.create).toHaveBeenCalledWith({
        name: "Minimal Club",
      });
      expect(result).toEqual({
        club: minimalClub,
      });
    });

    it("should throw AppException when user lacks permission", async () => {
      // Arrange
      const requestWithMemberRole: CreateClubRequest = {
        ...mockCreateClubRequest,
        userRoles: [ROLE_NAMES.MEMBER],
      };

      // Act & Assert
      await expect(
        createClubUseCase.execute(requestWithMemberRole)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only committee and president roles can create clubs.",
          403
        )
      );
      expect(mockClubRepository.findByName).not.toHaveBeenCalled();
      expect(mockClubRepository.create).not.toHaveBeenCalled();
    });

    it("should throw AppException when user has no roles", async () => {
      // Arrange
      const requestWithNoRoles: CreateClubRequest = {
        ...mockCreateClubRequest,
        userRoles: [],
      };

      // Act & Assert
      await expect(
        createClubUseCase.execute(requestWithNoRoles)
      ).rejects.toThrow(
        new AppException(
          "Insufficient permissions. Only committee and president roles can create clubs.",
          403
        )
      );
      expect(mockClubRepository.findByName).not.toHaveBeenCalled();
      expect(mockClubRepository.create).not.toHaveBeenCalled();
    });

    it("should throw AppException when club name already exists", async () => {
      // Arrange
      const existingClub = createMockClub({
        name: "Video Games Club",
      });
      mockClubRepository.findByName.mockResolvedValue(existingClub);

      // Act & Assert
      await expect(
        createClubUseCase.execute(mockCreateClubRequest)
      ).rejects.toThrow(
        new AppException("Club with this name already exists", 400)
      );
      expect(mockClubRepository.findByName).toHaveBeenCalledWith(
        "Video Games Club"
      );
      expect(mockClubRepository.create).not.toHaveBeenCalled();
    });

    it("should throw AppException when repository create fails", async () => {
      // Arrange
      const repositoryError = new Error("Database connection failed");
      mockClubRepository.findByName.mockResolvedValue(null);
      mockClubRepository.create.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(
        createClubUseCase.execute(mockCreateClubRequest)
      ).rejects.toThrow(repositoryError);
      expect(mockClubRepository.findByName).toHaveBeenCalledWith(
        "Video Games Club"
      );
      expect(mockClubRepository.create).toHaveBeenCalledWith({
        name: "Video Games Club",
        description: "A club for video game enthusiasts",
        logoUrl: "https://example.com/logo.png",
      });
    });

    it("should throw AppException when findByName fails", async () => {
      // Arrange
      const repositoryError = new Error("Database connection failed");
      mockClubRepository.findByName.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(
        createClubUseCase.execute(mockCreateClubRequest)
      ).rejects.toThrow(repositoryError);
      expect(mockClubRepository.findByName).toHaveBeenCalledWith(
        "Video Games Club"
      );
      expect(mockClubRepository.create).not.toHaveBeenCalled();
    });

    it("should work with multiple allowed roles", async () => {
      // Arrange
      const requestWithMultipleRoles: CreateClubRequest = {
        ...mockCreateClubRequest,
        userRoles: [ROLE_NAMES.MEMBER, ROLE_NAMES.COMMITTEE, ROLE_NAMES.LEADER],
      };
      mockClubRepository.findByName.mockResolvedValue(null);
      mockClubRepository.create.mockResolvedValue(mockCreatedClub);

      // Act
      const result = await createClubUseCase.execute(requestWithMultipleRoles);

      // Assert
      expect(result).toEqual({
        club: mockCreatedClub,
      });
    });

    it("should handle undefined description and logoUrl correctly", async () => {
      // Arrange
      const requestWithUndefinedFields: CreateClubRequest = {
        name: "Test Club",
        description: undefined,
        logoUrl: undefined,
        userRoles: [ROLE_NAMES.COMMITTEE],
      };
      const clubWithUndefinedFields = createMockClub({
        name: "Test Club",
        description: undefined,
        logoUrl: undefined,
      });
      mockClubRepository.findByName.mockResolvedValue(null);
      mockClubRepository.create.mockResolvedValue(clubWithUndefinedFields);

      // Act
      const result = await createClubUseCase.execute(
        requestWithUndefinedFields
      );

      // Assert
      expect(mockClubRepository.create).toHaveBeenCalledWith({
        name: "Test Club",
      });
      expect(result).toEqual({
        club: clubWithUndefinedFields,
      });
    });
  });
});
