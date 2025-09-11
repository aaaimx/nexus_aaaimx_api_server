import { IUserRepository } from "@/domain/repositories/user.repository";
import { UserMapper } from "@/domain/mappers/user.mapper";
import { DefaultRoleService } from "@/application/services/auth";
import { UserValidationService } from "@/application/services/auth";
import {
  PasswordService,
  VerificationCodeService,
  MailService,
} from "@/infrastructure/external-services";
import AppException from "@/shared/utils/exception.util";

export interface SignupInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  birth_date: string;
  bio?: string;
}

export interface SignupOutput {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  bio?: string;
  photoUrl?: string;
  emailVerified: boolean;
  roleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SignupUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: PasswordService,
    private readonly verificationCodeService: VerificationCodeService,
    private readonly mailService: MailService,
    private readonly defaultRoleService: DefaultRoleService,
    private readonly userValidationService: UserValidationService
  ) {}

  async execute(input: SignupInput): Promise<SignupOutput> {
    try {
      // Validate email doesn't exist
      await this.userValidationService.validateEmailNotExists(input.email);

      // Get default role
      const defaultRole = await this.defaultRoleService.getDefaultRole();

      // Hash password
      const hashedPassword = await this.passwordService.hash(input.password);

      // Generate verification code
      const verificationCode = this.verificationCodeService.generateCode();

      // Create user
      const userData = UserMapper.mapToUserData(input, {
        password: hashedPassword,
        isEmailVerified: false,
        isActive: true,
        allowNotifications: true,
        verificationCode: verificationCode.code,
        verificationExpires: verificationCode.expiresAt,
      });

      const createdUser = await this.userRepository.create(userData);

      // Assign default role to user
      await this.userRepository.assignRole(createdUser.id, defaultRole.id);

      // Send verification email
      await this.mailService.sendVerificationEmail(
        createdUser.email,
        verificationCode.code,
        createdUser.firstName
      );

      // Return user data (without password)
      const result = UserMapper.mapToUserOutput(createdUser, input, {
        roleId: defaultRole.id,
      }) as SignupOutput;

      return result;
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(
        `Error during signup: ${(error as Error).message}`,
        500
      );
    }
  }
}
