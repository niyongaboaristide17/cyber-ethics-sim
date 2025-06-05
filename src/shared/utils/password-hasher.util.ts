import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';

export class PasswordHasher {
  static async hashPassword(password: string): Promise<string> {
    const saltRoundsEnv = process.env.BCRYPT_SALT_ROUNDS;

    const saltRounds = parseInt(saltRoundsEnv || '', 10);

    if (isNaN(saltRounds)) {
      throw new BadRequestException(
        'Invalid BCRYPT_SALT_ROUNDS value in environment',
      );
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
