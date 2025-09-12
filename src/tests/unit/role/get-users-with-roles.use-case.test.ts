import {
  GetUsersWithRolesUseCase,
  GetUsersWithRolesInput,
} from "@/application/use-cases/role/get-users-with-roles.use-case";
import { IUserRepository } from "@/domain/repositories";
import { UserWithRole } from "@/domain/entities";
import { ROLE_NAMES } from "@/shared/constants";
import AppException from "@/shared/utils/exception.util";

// Mock the logger
jest.mock("@/infrastructure/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe("GetUsersWithRolesUseCase", () => {
  let getUsersWithRolesUseCase: GetUsersWithRolesUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  const mockRequesterUser: UserWithRole = {
    id: "requester-123",
    email: "requester@example.com",
    firstName: "Requester",
    lastName: "User",
    isEmailVerified: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    allowNotifications: true,
    role: {
      id: "role-president",
      name: ROLE_NAMES.PRESIDENT,
      description: "President Role",
    },
    divisions: [],
    clubs: [],
  };

  const mockUsers: UserWithRole[] = [
    {
      id: "user-1",
      email: "user1@example.com",
      firstName: "User",
      lastName: "One",
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      allowNotifications: true,
      role: {
        id: "role-leader",
        name: ROLE_NAMES.LEADER,
        description: "Leader Role",
      },
      divisions: [
        { id: "div-1", name: "Division 1", description: "Test Division" },
      ],
      clubs: [{ id: "club-1", name: "Club 1", description: "Test Club" }],
    },
    {
      id: "user-2",
      email: "user2@example.com",
      firstName: "User",
      lastName: "Two",
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      allowNotifications: true,
      role: {
        id: "role-member",
        name: ROLE_NAMES.MEMBER,
        description: "Member Role",
      },
      divisions: [
        { id: "div-1", name: "Division 1", description: "Test Division" },
      ],
      clubs: [{ id: "club-1", name: "Club 1", description: "Test Club" }],
    },
  ];

  const mockUsersWithPagination = {
    users: mockUsers,
    total: 2,
  };

  beforeEach(() => {
    mockUserRepository = {
      findUserWithRole: jest.fn(),
      findUsersWithRoles: jest.fn(),
      findUsersByDivision: jest.fn(),
      findUsersByClub: jest.fn(),
      findUsersByRole: jest.fn(),
    } as any;

    getUsersWithRolesUseCase = new GetUsersWithRolesUseCase(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    const baseInput: GetUsersWithRolesInput = {
      requesterUserId: "requester-123",
    };

    it("should successfully get all users with roles", async () => {
      mockUserRepository.findUserWithRole.mockResolvedValue(mockRequesterUser);
      mockUserRepository.findUsersWithRoles.mockResolvedValue(
        mockUsersWithPagination
      );

      const result = await getUsersWithRolesUseCase.execute(baseInput);

      expect(result).toEqual({
        users: mockUsers,
        total: 2,
        message: "Retrieved 2 users successfully",
      });

      expect(mockUserRepository.findUserWithRole).toHaveBeenCalledWith(
        "requester-123"
      );
      expect(mockUserRepository.findUsersWithRoles).toHaveBeenCalledWith(0, 50);
    });

    it("should get users with custom pagination", async () => {
      const inputWithPagination = {
        ...baseInput,
        skip: 10,
        limit: 20,
      };

      mockUserRepository.findUserWithRole.mockResolvedValue(mockRequesterUser);
      mockUserRepository.findUsersWithRoles.mockResolvedValue(
        mockUsersWithPagination
      );

      const result = await getUsersWithRolesUseCase.execute(
        inputWithPagination
      );

      expect(result).toEqual({
        users: mockUsers,
        total: 2,
        message: "Retrieved 2 users successfully",
      });

      expect(mockUserRepository.findUsersWithRoles).toHaveBeenCalledWith(
        10,
        20
      );
    });

    it("should get users filtered by division", async () => {
      const inputWithDivision = {
        ...baseInput,
        divisionId: "div-1",
      };

      mockUserRepository.findUserWithRole.mockResolvedValue(mockRequesterUser);
      mockUserRepository.findUsersByDivision.mockResolvedValue(mockUsers);

      const result = await getUsersWithRolesUseCase.execute(inputWithDivision);

      expect(result).toEqual({
        users: mockUsers,
        total: 2,
        message: "Retrieved 2 users successfully",
      });

      expect(mockUserRepository.findUsersByDivision).toHaveBeenCalledWith(
        "div-1"
      );
      expect(mockUserRepository.findUsersWithRoles).not.toHaveBeenCalled();
    });

    it("should get users filtered by club", async () => {
      const inputWithClub = {
        ...baseInput,
        clubId: "club-1",
      };

      mockUserRepository.findUserWithRole.mockResolvedValue(mockRequesterUser);
      mockUserRepository.findUsersByClub.mockResolvedValue(mockUsers);

      const result = await getUsersWithRolesUseCase.execute(inputWithClub);

      expect(result).toEqual({
        users: mockUsers,
        total: 2,
        message: "Retrieved 2 users successfully",
      });

      expect(mockUserRepository.findUsersByClub).toHaveBeenCalledWith("club-1");
      expect(mockUserRepository.findUsersWithRoles).not.toHaveBeenCalled();
    });

    it("should get users filtered by role", async () => {
      const inputWithRole = {
        ...baseInput,
        roleId: "role-leader",
      };

      mockUserRepository.findUserWithRole.mockResolvedValue(mockRequesterUser);
      mockUserRepository.findUsersByRole.mockResolvedValue([mockUsers[0]]);

      const result = await getUsersWithRolesUseCase.execute(inputWithRole);

      expect(result).toEqual({
        users: [mockUsers[0]],
        total: 1,
        message: "Retrieved 1 users successfully",
      });

      expect(mockUserRepository.findUsersByRole).toHaveBeenCalledWith(
        "role-leader"
      );
      expect(mockUserRepository.findUsersWithRoles).not.toHaveBeenCalled();
    });

    it("should throw error when user has no permissions", async () => {
      const memberRequester = {
        ...mockRequesterUser,
        role: {
          id: "role-member",
          name: ROLE_NAMES.MEMBER,
          description: "Member Role",
        },
      };

      mockUserRepository.findUserWithRole.mockResolvedValue(memberRequester);

      await expect(getUsersWithRolesUseCase.execute(baseInput)).rejects.toThrow(
        AppException
      );

      expect(mockUserRepository.findUsersWithRoles).not.toHaveBeenCalled();
    });

    it("should throw error when requester user not found", async () => {
      mockUserRepository.findUserWithRole.mockResolvedValue(null);

      await expect(getUsersWithRolesUseCase.execute(baseInput)).rejects.toThrow(
        AppException
      );

      expect(mockUserRepository.findUsersWithRoles).not.toHaveBeenCalled();
    });

    it("should handle empty results", async () => {
      mockUserRepository.findUserWithRole.mockResolvedValue(mockRequesterUser);
      mockUserRepository.findUsersWithRoles.mockResolvedValue({
        users: [],
        total: 0,
      });

      const result = await getUsersWithRolesUseCase.execute(baseInput);

      expect(result).toEqual({
        users: [],
        total: 0,
        message: "Retrieved 0 users successfully",
      });
    });

    it("should handle repository errors", async () => {
      mockUserRepository.findUserWithRole.mockResolvedValue(mockRequesterUser);
      mockUserRepository.findUsersWithRoles.mockRejectedValue(
        new Error("Database error")
      );

      await expect(getUsersWithRolesUseCase.execute(baseInput)).rejects.toThrow(
        AppException
      );
    });

    it("should prioritize division filter over club filter", async () => {
      const inputWithBothFilters = {
        ...baseInput,
        divisionId: "div-1",
        clubId: "club-1",
      };

      mockUserRepository.findUserWithRole.mockResolvedValue(mockRequesterUser);
      mockUserRepository.findUsersByDivision.mockResolvedValue(mockUsers);

      await getUsersWithRolesUseCase.execute(inputWithBothFilters);

      expect(mockUserRepository.findUsersByDivision).toHaveBeenCalledWith(
        "div-1"
      );
      expect(mockUserRepository.findUsersByClub).not.toHaveBeenCalled();
      expect(mockUserRepository.findUsersByRole).not.toHaveBeenCalled();
      expect(mockUserRepository.findUsersWithRoles).not.toHaveBeenCalled();
    });

    it("should prioritize club filter over role filter", async () => {
      const inputWithClubAndRole = {
        ...baseInput,
        clubId: "club-1",
        roleId: "role-leader",
      };

      mockUserRepository.findUserWithRole.mockResolvedValue(mockRequesterUser);
      mockUserRepository.findUsersByClub.mockResolvedValue(mockUsers);

      await getUsersWithRolesUseCase.execute(inputWithClubAndRole);

      expect(mockUserRepository.findUsersByClub).toHaveBeenCalledWith("club-1");
      expect(mockUserRepository.findUsersByRole).not.toHaveBeenCalled();
      expect(mockUserRepository.findUsersWithRoles).not.toHaveBeenCalled();
    });
  });
});
