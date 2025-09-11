import { GetDivisionsCatalogUseCase } from "@/application/use-cases/division/get-divisions-catalog.use-case";
import { IDivisionRepository } from "@/domain/repositories/division.repository";
import { Division } from "@/domain/entities/division.entity";
import AppException from "@/shared/utils/exception.util";
import {
  createMockDivisionRepository,
  createMockDivision,
} from "@/tests/test-helpers";

// Mock logger
jest.mock("@/infrastructure/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe("GetDivisionsCatalogUseCase", () => {
  let getDivisionsCatalogUseCase: GetDivisionsCatalogUseCase;
  let mockDivisionRepository: jest.Mocked<IDivisionRepository>;

  const mockDivisions: Division[] = [
    createMockDivision({
      id: "division-1",
      name: "Software",
      description:
        "División de Software - Desarrollo de aplicaciones, sistemas y soluciones tecnológicas",
    }),
    createMockDivision({
      id: "division-2",
      name: "Robotics",
      description:
        "División de Robótica - Diseño, construcción y programación de robots y sistemas automatizados",
    }),
    createMockDivision({
      id: "division-3",
      name: "Artificial Intelligence",
      description:
        "División de Inteligencia Artificial - Machine Learning, Deep Learning y algoritmos inteligentes",
    }),
  ];

  beforeEach(() => {
    // Create mocks
    mockDivisionRepository = createMockDivisionRepository();

    // Create use case instance
    getDivisionsCatalogUseCase = new GetDivisionsCatalogUseCase(
      mockDivisionRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully retrieve divisions catalog", async () => {
      // Arrange
      mockDivisionRepository.findAll.mockResolvedValue(mockDivisions);

      // Act
      const result = await getDivisionsCatalogUseCase.execute();

      // Assert
      expect(mockDivisionRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDivisions);
    });

    it("should return empty array when no divisions exist", async () => {
      // Arrange
      mockDivisionRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await getDivisionsCatalogUseCase.execute();

      // Assert
      expect(mockDivisionRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it("should throw AppException when repository throws error", async () => {
      // Arrange
      const errorMessage = "Database connection failed";
      mockDivisionRepository.findAll.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(getDivisionsCatalogUseCase.execute()).rejects.toThrow(
        new AppException("Failed to retrieve divisions catalog", 500)
      );
    });

    it("should rethrow AppException when it's already an AppException", async () => {
      // Arrange
      const appException = new AppException("Custom error", 400);
      mockDivisionRepository.findAll.mockRejectedValue(appException);

      // Act & Assert
      await expect(getDivisionsCatalogUseCase.execute()).rejects.toThrow(
        appException
      );
    });

    it("should return empty array when repository returns null", async () => {
      // Arrange
      mockDivisionRepository.findAll.mockResolvedValue(null as any);

      // Act
      const result = await getDivisionsCatalogUseCase.execute();

      // Assert
      expect(mockDivisionRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it("should return empty array when repository returns undefined", async () => {
      // Arrange
      mockDivisionRepository.findAll.mockResolvedValue(undefined as any);

      // Act
      const result = await getDivisionsCatalogUseCase.execute();

      // Assert
      expect(mockDivisionRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it("should handle single division in catalog", async () => {
      // Arrange
      const singleDivision = [createMockDivision()];
      mockDivisionRepository.findAll.mockResolvedValue(singleDivision);

      // Act
      const result = await getDivisionsCatalogUseCase.execute();

      // Assert
      expect(mockDivisionRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(singleDivision);
      expect(result).toHaveLength(1);
    });

    it("should handle divisions with minimal data", async () => {
      // Arrange
      const minimalDivisions: Division[] = [
        createMockDivision({
          id: "division-1",
          name: "Software",
          description: undefined,
          logoUrl: undefined,
        }),
      ];
      mockDivisionRepository.findAll.mockResolvedValue(minimalDivisions);

      // Act
      const result = await getDivisionsCatalogUseCase.execute();

      // Assert
      expect(mockDivisionRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(minimalDivisions);
      expect(result[0].description).toBeUndefined();
      expect(result[0].logoUrl).toBeUndefined();
    });
  });
});
