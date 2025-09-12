import {
  GetAssignableRolesUseCase,
  GetAssignableRolesInput,
} from "@/application/use-cases/role/get-assignable-roles.use-case";
import { IUserRepository, IRoleRepository } from "@/domain/repositories";
import { UserWithRole, Role } from "@/domain/entities";
import { ROLE_NAMES } from "@/shared/constants";
import AppException from "@/shared/utils/exception.util";

// Mock the logger
jest.mock("@/infrastructure/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe("GetAssignableRolesUseCase", () => {
  let getAssignableRolesUseCase: GetAssignableRolesUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockRoleRepository: jest.Mocked<IRoleRepository>;

  const mockPresidentUser: UserWithRole = {
    id: "president-123",
    email: "president@example.com",
    firstName: "President",
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

  const mockCommitteeUser: UserWithRole = {
    id: "committee-123",
    email: "committee@example.com",
    firstName: "Committee",
    lastName: "User",
    isEmailVerified: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    allowNotifications: true,
    role: {
      id: "role-committee",
      name: ROLE_NAMES.COMMITTEE,
      description: "Committee Role",
    },
    divisions: [],
    clubs: [],
  };

  const mockLeaderUser: UserWithRole = {
    id: "leader-123",
    email: "leader@example.com",
    firstName: "Leader",
    lastName: "User",
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
    divisions: [],
    clubs: [],
  };

  const mockMemberUser: UserWithRole = {
    id: "member-123",
    email: "member@example.com",
    firstName: "Member",
    lastName: "User",
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
    divisions: [],
    clubs: [],
  };

  const mockAllRoles: Role[] = [
    {
      id: "role-president",
      name: ROLE_NAMES.PRESIDENT,
      description: "President Role",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "role-committee",
      name: ROLE_NAMES.COMMITTEE,
      description: "Committee Role",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "role-leader",
      name: ROLE_NAMES.LEADER,
      description: "Leader Role",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "role-co-leader",
      name: ROLE_NAMES.CO_LEADER,
      description: "Co-Leader Role",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "role-member",
      name: ROLE_NAMES.MEMBER,
      description: "Member Role",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "role-senior-member",
      name: ROLE_NAMES.SENIOR_MEMBER,
      description: "Senior Member Role",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockAssignRoleInput: GetAssignableRolesInput = {
    userId: "president-123",
  };

  beforeEach(() => {
    mockUserRepository = {
      findUserWithRole: jest.fn(),
    } as any;

    mockRoleRepository = {
      findAll: jest.fn(),
    } as any;

    getAssignableRolesUseCase = new GetAssignableRolesUseCase(
      mockUserRepository,
      mockRoleRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should return all roles for president", async () => {
      mockUserRepository.findUserWithRole.mockResolvedValue(mockPresidentUser);
      mockRoleRepository.findAll.mockResolvedValue(mockAllRoles);

      const result = await getAssignableRolesUseCase.execute(
        mockAssignRoleInput
      );

      expect(result).toEqual({
        roles: mockAllRoles.map((role) => ({
          id: role.id,
          name: role.name,
          description: role.description,
        })),
        message: "Retrieved 6 assignable roles successfully",
      });

      expect(mockUserRepository.findUserWithRole).toHaveBeenCalledWith(
        "president-123"
      );
      expect(mockRoleRepository.findAll).toHaveBeenCalled();
    });

    it("should return filtered roles for committee (excluding president)", async () => {
      const committeeInput = {
        ...mockAssignRoleInput,
        userId: "committee-123",
      };
      mockUserRepository.findUserWithRole.mockResolvedValue(mockCommitteeUser);
      mockRoleRepository.findAll.mockResolvedValue(mockAllRoles);

      const result = await getAssignableRolesUseCase.execute(committeeInput);

      expect(result.roles).toHaveLength(5);
      expect(result.roles.map((r) => r.name)).not.toContain(
        ROLE_NAMES.PRESIDENT
      );
      expect(result.roles.map((r) => r.name)).toContain(ROLE_NAMES.COMMITTEE);
      expect(result.roles.map((r) => r.name)).toContain(ROLE_NAMES.LEADER);
      expect(result.roles.map((r) => r.name)).toContain(ROLE_NAMES.MEMBER);

      expect(result.message).toBe("Retrieved 5 assignable roles successfully");
    });

    it("should return limited roles for leader", async () => {
      const leaderInput = { ...mockAssignRoleInput, userId: "leader-123" };
      mockUserRepository.findUserWithRole.mockResolvedValue(mockLeaderUser);
      mockRoleRepository.findAll.mockResolvedValue(mockAllRoles);

      const result = await getAssignableRolesUseCase.execute(leaderInput);

      expect(result.roles).toHaveLength(4);
      expect(result.roles.map((r) => r.name)).not.toContain(
        ROLE_NAMES.PRESIDENT
      );
      expect(result.roles.map((r) => r.name)).not.toContain(
        ROLE_NAMES.COMMITTEE
      );
      expect(result.roles.map((r) => r.name)).toContain(ROLE_NAMES.LEADER);
      expect(result.roles.map((r) => r.name)).toContain(ROLE_NAMES.CO_LEADER);
      expect(result.roles.map((r) => r.name)).toContain(ROLE_NAMES.MEMBER);
      expect(result.roles.map((r) => r.name)).toContain(
        ROLE_NAMES.SENIOR_MEMBER
      );

      expect(result.message).toBe("Retrieved 4 assignable roles successfully");
    });

    it("should return empty array for member", async () => {
      const memberInput = { ...mockAssignRoleInput, userId: "member-123" };
      mockUserRepository.findUserWithRole.mockResolvedValue(mockMemberUser);
      mockRoleRepository.findAll.mockResolvedValue(mockAllRoles);

      const result = await getAssignableRolesUseCase.execute(memberInput);

      expect(result).toEqual({
        roles: [],
        message: "Retrieved 0 assignable roles successfully",
      });
    });

    it("should throw error when user not found", async () => {
      mockUserRepository.findUserWithRole.mockResolvedValue(null);

      await expect(
        getAssignableRolesUseCase.execute(mockAssignRoleInput)
      ).rejects.toThrow(AppException);

      expect(mockRoleRepository.findAll).not.toHaveBeenCalled();
    });

    it("should handle empty roles list", async () => {
      mockUserRepository.findUserWithRole.mockResolvedValue(mockPresidentUser);
      mockRoleRepository.findAll.mockResolvedValue([]);

      const result = await getAssignableRolesUseCase.execute(
        mockAssignRoleInput
      );

      expect(result).toEqual({
        roles: [],
        message: "Retrieved 0 assignable roles successfully",
      });
    });

    it("should handle repository errors", async () => {
      mockUserRepository.findUserWithRole.mockResolvedValue(mockPresidentUser);
      mockRoleRepository.findAll.mockRejectedValue(new Error("Database error"));

      await expect(
        getAssignableRolesUseCase.execute(mockAssignRoleInput)
      ).rejects.toThrow(AppException);
    });

    it("should handle user with unknown role", async () => {
      const unknownRoleUser = {
        ...mockPresidentUser,
        role: {
          id: "role-unknown",
          name: "unknown",
          description: "Unknown Role",
        },
      };

      mockUserRepository.findUserWithRole.mockResolvedValue(unknownRoleUser);
      mockRoleRepository.findAll.mockResolvedValue(mockAllRoles);

      const result = await getAssignableRolesUseCase.execute(
        mockAssignRoleInput
      );

      expect(result).toEqual({
        roles: [],
        message: "Retrieved 0 assignable roles successfully",
      });
    });

    it("should return correct role structure", async () => {
      mockUserRepository.findUserWithRole.mockResolvedValue(mockPresidentUser);
      mockRoleRepository.findAll.mockResolvedValue(mockAllRoles);

      const result = await getAssignableRolesUseCase.execute(
        mockAssignRoleInput
      );

      expect(result.roles[0]).toEqual({
        id: "role-president",
        name: ROLE_NAMES.PRESIDENT,
        description: "President Role",
      });

      expect(result.roles).toHaveLength(6);
      result.roles.forEach((role) => {
        expect(role).toHaveProperty("id");
        expect(role).toHaveProperty("name");
        expect(role).toHaveProperty("description");
        expect(role).not.toHaveProperty("createdAt");
        expect(role).not.toHaveProperty("updatedAt");
      });
    });
  });
});
