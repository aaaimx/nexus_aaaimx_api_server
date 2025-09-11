import { User } from "@/domain/entities/user.entity";

export class UserMapper {
  /**
   * Maps input data to User entity, only including defined values
   */
  static mapToUserData<T extends Record<string, any>>(
    input: T,
    baseData: Partial<User> = {}
  ): Partial<User> {
    const fieldMappings = {
      firstName: input["first_name"] || input["firstName"],
      lastName: input["last_name"] || input["lastName"],
      email: input["email"],
      password: input["password"],
      bio: input["bio"],
      photoUrl: input["photo_url"] || input["photoUrl"],
      googleId: input["google_id"] || input["googleId"],
      isEmailVerified: input["is_email_verified"] || input["isEmailVerified"],
      isActive: input["is_active"] || input["isActive"],
      allowNotifications:
        input["allow_notifications"] || input["allowNotifications"],
      verificationCode: input["verification_code"] || input["verificationCode"],
      verificationExpires:
        input["verification_expires"] || input["verificationExpires"],
      resetPasswordCode:
        input["reset_password_code"] || input["resetPasswordCode"],
      resetPasswordExpires:
        input["reset_password_expires"] || input["resetPasswordExpires"],
    };

    const userData = { ...baseData };

    // Only add defined values to userData, but don't override baseData
    Object.entries(fieldMappings).forEach(([key, value]) => {
      if (value !== undefined && !(key in baseData)) {
        (userData as any)[key] = value;
      }
    });

    return userData;
  }

  /**
   * Maps User entity to output format, only including defined values
   */
  static mapToUserOutput<T extends Record<string, any>>(
    user: User,
    input: T,
    baseOutput: Record<string, any> = {}
  ): Record<string, any> {
    const output = { ...baseOutput };

    const fieldMappings = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      birthDate: input["birth_date"] || input["birthDate"],
      bio: user.bio,
      photoUrl: user.photoUrl,
      emailVerified: user.isEmailVerified,
      roleId: input["roleId"],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Only add defined values to output
    Object.entries(fieldMappings).forEach(([key, value]) => {
      if (value !== undefined) {
        output[key] = value;
      }
    });

    return output;
  }
}
