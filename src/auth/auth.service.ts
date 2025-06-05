import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordHasher } from '../shared/utils/password-hasher.util';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.usersService.findOneByEmail(email);
    if (
      user &&
      (await PasswordHasher.comparePassword(password, user.password))
    ) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async signIn(user: UserDocument) {
    const payload = {
      sub: user._id.toHexString(),
      is2FAValidated: !user.isTwoFactorAuthenticationEnabled,
    };

    await this.usersService.updateLastLogin(user._id);

    if (!user.isTwoFactorAuthenticationEnabled) {
      return { accessToken: this.jwtService.sign(payload) };
    }

    return {
      partialToken: this.jwtService.sign(payload, { expiresIn: '5m' }),
    };
  }
}
