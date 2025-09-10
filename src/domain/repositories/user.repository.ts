import { User } from "@/domain/entities/user.entity";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(user: Partial<User>): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  findByVerificationCode(code: string): Promise<User | null>;
  findByResetPasswordCode(code: string): Promise<User | null>;
  assignRole(userId: string, roleId: string): Promise<void>;
  clearResetPasswordFields(id: string): Promise<void>;
  clearVerificationFields(id: string): Promise<void>;
  getUserRoleId(userId: string): Promise<string | null>;
}
