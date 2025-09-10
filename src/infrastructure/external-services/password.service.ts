import bcrypt from "bcrypt";

export default class PasswordService {
  async compare(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
