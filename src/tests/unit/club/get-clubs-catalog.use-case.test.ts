import { GetClubsCatalogUseCase } from "@/application/use-cases/club/get-clubs-catalog.use-case";
import { IClubRepository } from "@/domain/repositories/club.repository";
import { Club } from "@/domain/entities/club.entity";
import AppException from "@/shared/utils/exception.util";
import { createMockClubRepository, createMockClub } from "@/tests/test-helpers";

// Mock logger
jest.mock("@/infrastructure/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe("GetClubsCatalogUseCase", () => {
  let getClubsCatalogUseCase: GetClubsCatalogUseCase;
  let mockClubRepository: jest.Mocked<IClubRepository>;

  const mockClubs: Club[] = [
    createMockClub({
      id: "club-1",
      name: "Video Games",
      description:
        "Club de Videojuegos - Club para jugar videojuegos y participar en competencias",
    }),
    createMockClub({
      id: "club-2",
      name: "Board Games",
      description:
        "Club de Juegos de Mesa - Club para jugar juegos de mesa y socializar",
    }),
  ];

  beforeEach(() => {
    // Create mocks
    mockClubRepository = createMockClubRepository();

    // Create use case instance
    getClubsCatalogUseCase = new GetClubsCatalogUseCase(mockClubRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully retrieve clubs catalog", async () => {
      // Arrange
      mockClubRepository.findAll.mockResolvedValue(mockClubs);

      // Act
      const result = await getClubsCatalogUseCase.execute();

      // Assert
      expect(mockClubRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockClubs);
    });

    it("should return empty array when no clubs exist", async () => {
      // Arrange
      mockClubRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await getClubsCatalogUseCase.execute();

      // Assert
      expect(mockClubRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it("should throw AppException when repository throws error", async () => {
      // Arrange
      const errorMessage = "Database connection failed";
      mockClubRepository.findAll.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(getClubsCatalogUseCase.execute()).rejects.toThrow(
        new AppException("Failed to retrieve clubs catalog", 500)
      );
    });

    it("should rethrow AppException when it's already an AppException", async () => {
      // Arrange
      const appException = new AppException("Custom error", 400);
      mockClubRepository.findAll.mockRejectedValue(appException);

      // Act & Assert
      await expect(getClubsCatalogUseCase.execute()).rejects.toThrow(
        appException
      );
    });

    it("should return empty array when repository returns null", async () => {
      // Arrange
      mockClubRepository.findAll.mockResolvedValue(null as any);

      // Act
      const result = await getClubsCatalogUseCase.execute();

      // Assert
      expect(mockClubRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it("should return empty array when repository returns undefined", async () => {
      // Arrange
      mockClubRepository.findAll.mockResolvedValue(undefined as any);

      // Act
      const result = await getClubsCatalogUseCase.execute();

      // Assert
      expect(mockClubRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it("should handle single club in catalog", async () => {
      // Arrange
      const singleClub = [createMockClub()];
      mockClubRepository.findAll.mockResolvedValue(singleClub);

      // Act
      const result = await getClubsCatalogUseCase.execute();

      // Assert
      expect(mockClubRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(singleClub);
      expect(result).toHaveLength(1);
    });

    it("should handle clubs with minimal data", async () => {
      // Arrange
      const minimalClubs: Club[] = [
        createMockClub({
          id: "club-1",
          name: "Video Games",
          description: undefined,
          logoUrl: undefined,
        }),
      ];
      mockClubRepository.findAll.mockResolvedValue(minimalClubs);

      // Act
      const result = await getClubsCatalogUseCase.execute();

      // Assert
      expect(mockClubRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(minimalClubs);
      expect(result[0].description).toBeUndefined();
      expect(result[0].logoUrl).toBeUndefined();
    });
  });
});
