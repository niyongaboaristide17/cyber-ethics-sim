import * as bcrypt from 'bcrypt';

export class PasswordHasher {
  static async hashPassword(
    password: string,
    saltRounds: number,
  ): Promise<string> {
    if (isNaN(saltRounds)) {
      throw new Error('Salt rounds must be a valid number');
    }

    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
