import {
  AssignRoleUseCase,
  AssignRoleInput,
} from "@/application/use-cases/role/assign-role.use-case";
import { IUserRepository, IRoleRepository } from "@/domain/repositories";
import { UserWithRole, Role } from "@/domain/entities";
import { ROLE_NAMES } from "@/shared/constants";
import AppException from "@/shared/utils/exception.util";

// Mock the logger
jest.mock("@/infrastructure/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe("AssignRoleUseCase", () => {
  let assignRoleUseCase: AssignRoleUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockRoleRepository: jest.Mocked<IRoleRepository>;

  const mockEditorUser: UserWithRole = {
    id: "editor-123",
    email: "editor@example.com",
    firstName: "Editor",
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

  const mockTargetUser: UserWithRole = {
    id: "target-123",
    email: "target@example.com",
    firstName: "Target",
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

  const mockUpdatedTargetUser: UserWithRole = {
    ...mockTargetUser,
    role: {
      id: "role-leader",
      name: ROLE_NAMES.LEADER,
      description: "Leader Role",
    },
  };

  const mockLeaderRole: Role = {
    id: "role-leader",
    name: ROLE_NAMES.LEADER,
    description: "Leader Role",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAssignRoleInput: AssignRoleInput = {
    editorUserId: "editor-123",
    targetUserId: "target-123",
    newRoleId: "role-leader",
  };

  beforeEach(() => {
    mockUserRepository = {
      findUserWithRole: jest.fn(),
      updateUserRole: jest.fn(),
    } as any;

    mockRoleRepository = {
      findById: jest.fn(),
    } as any;

    assignRoleUseCase = new AssignRoleUseCase(
      mockUserRepository,
      mockRoleRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully assign role to user", async () => {
      // Mock the calls in the order they happen in the use case:
      // 1. First call in validateRoleEditPermission (editor user)
      // 2. Second call in validateRoleEditPermission (target user)
      // 3. Third call to get current user before update (target user)
      // 4. Fourth call to get updated user after update (target user)
      mockUserRepository.findUserWithRole
        .mockResolvedValueOnce(mockEditorUser) // validateRoleEditPermission - editor
        .mockResolvedValueOnce(mockTargetUser) // validateRoleEditPermission - target
        .mockResolvedValueOnce(mockTargetUser) // get current user before update
        .mockResolvedValueOnce(mockUpdatedTargetUser); // get updated user after update
      mockRoleRepository.findById.mockResolvedValue(mockLeaderRole);

      const result = await assignRoleUseCase.execute(mockAssignRoleInput);

      expect(result).toEqual({
        user: mockUpdatedTargetUser,
        message: `User role updated from '${ROLE_NAMES.MEMBER}' to '${ROLE_NAMES.LEADER}' successfully`,
      });

      expect(mockUserRepository.findUserWithRole).toHaveBeenCalledWith(
        "editor-123"
      );
      expect(mockUserRepository.findUserWithRole).toHaveBeenCalledWith(
        "target-123"
      );
      expect(mockRoleRepository.findById).toHaveBeenCalledWith("role-leader");
      expect(mockUserRepository.updateUserRole).toHaveBeenCalledWith(
        "target-123",
        "role-leader"
      );
    });

    it("should throw error when editor user not found", async () => {
      mockUserRepository.findUserWithRole.mockResolvedValueOnce(null); // validateRoleEditPermission - editor not found

      await expect(
        assignRoleUseCase.execute(mockAssignRoleInput)
      ).rejects.toThrow(AppException);

      expect(mockUserRepository.updateUserRole).not.toHaveBeenCalled();
    });

    it("should throw error when target user not found", async () => {
      mockUserRepository.findUserWithRole
        .mockResolvedValueOnce(mockEditorUser) // validateRoleEditPermission - editor
        .mockResolvedValueOnce(null); // validateRoleEditPermission - target not found

      await expect(
        assignRoleUseCase.execute(mockAssignRoleInput)
      ).rejects.toThrow(AppException);

      expect(mockUserRepository.updateUserRole).not.toHaveBeenCalled();
    });

    it("should throw error when new role not found", async () => {
      mockUserRepository.findUserWithRole
        .mockResolvedValueOnce(mockEditorUser) // validateRoleEditPermission - editor
        .mockResolvedValueOnce(mockTargetUser); // validateRoleEditPermission - target
      mockRoleRepository.findById.mockResolvedValue(null);

      await expect(
        assignRoleUseCase.execute(mockAssignRoleInput)
      ).rejects.toThrow(AppException);

      expect(mockUserRepository.updateUserRole).not.toHaveBeenCalled();
    });

    it("should throw error when user has insufficient permissions", async () => {
      const memberEditor = {
        ...mockEditorUser,
        role: {
          id: "role-member",
          name: ROLE_NAMES.MEMBER,
          description: "Member Role",
        },
      };

      mockUserRepository.findUserWithRole
        .mockResolvedValueOnce(memberEditor) // validateRoleEditPermission - editor
        .mockResolvedValueOnce(mockTargetUser); // validateRoleEditPermission - target
      mockRoleRepository.findById.mockResolvedValue(mockLeaderRole);

      await expect(
        assignRoleUseCase.execute(mockAssignRoleInput)
      ).rejects.toThrow(AppException);

      expect(mockUserRepository.updateUserRole).not.toHaveBeenCalled();
    });

    it("should throw error when role assignment fails", async () => {
      mockUserRepository.findUserWithRole
        .mockResolvedValueOnce(mockEditorUser) // validateRoleEditPermission - editor
        .mockResolvedValueOnce(mockTargetUser) // validateRoleEditPermission - target
        .mockResolvedValueOnce(mockTargetUser); // get current user before update
      mockRoleRepository.findById.mockResolvedValue(mockLeaderRole);
      mockUserRepository.updateUserRole.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        assignRoleUseCase.execute(mockAssignRoleInput)
      ).rejects.toThrow(AppException);
    });

    it("should throw error when updated user cannot be retrieved", async () => {
      mockUserRepository.findUserWithRole
        .mockResolvedValueOnce(mockEditorUser) // validateRoleEditPermission - editor
        .mockResolvedValueOnce(mockTargetUser) // validateRoleEditPermission - target
        .mockResolvedValueOnce(mockTargetUser) // get current user before update
        .mockResolvedValueOnce(null); // get updated user after update - fails
      mockRoleRepository.findById.mockResolvedValue(mockLeaderRole);
      mockUserRepository.updateUserRole.mockResolvedValue();

      await expect(
        assignRoleUseCase.execute(mockAssignRoleInput)
      ).rejects.toThrow(AppException);
    });

    it("should handle same role assignment", async () => {
      const sameRoleTarget = {
        ...mockTargetUser,
        role: {
          id: "role-leader",
          name: ROLE_NAMES.LEADER,
          description: "Leader Role",
        },
      };

      // Mock the calls in the order they happen in the use case:
      // 1. First call in validateRoleEditPermission (editor user)
      // 2. Second call in validateRoleEditPermission (target user)
      // 3. Third call to get current user before update (target user)
      // 4. Fourth call to get updated user after update (target user)
      mockUserRepository.findUserWithRole
        .mockResolvedValueOnce(mockEditorUser) // validateRoleEditPermission - editor
        .mockResolvedValueOnce(sameRoleTarget) // validateRoleEditPermission - target
        .mockResolvedValueOnce(sameRoleTarget) // get current user before update
        .mockResolvedValueOnce(sameRoleTarget); // get updated user after update
      mockRoleRepository.findById.mockResolvedValue(mockLeaderRole);

      const result = await assignRoleUseCase.execute(mockAssignRoleInput);

      expect(result).toEqual({
        user: sameRoleTarget,
        message: `User role updated from '${ROLE_NAMES.LEADER}' to '${ROLE_NAMES.LEADER}' successfully`,
      });

      expect(mockUserRepository.updateUserRole).toHaveBeenCalledWith(
        "target-123",
        "role-leader"
      );
    });
  });
});
