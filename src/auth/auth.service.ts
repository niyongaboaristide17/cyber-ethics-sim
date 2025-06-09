import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordHasher } from '../shared/utils/password-hasher.util';
import { UserDocument } from '../users/schemas/user.schema';
import { EmailService } from '../email/email.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly eventEmitter: EventEmitter2,
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

  async generateResetToken(email: string): Promise<void> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const payload = { sub: user._id.toHexString() };
    const resetToken = this.jwtService.sign(payload, {
      expiresIn: '15m', // Token valid for 15 minutes
    });

    // this.eventEmitter.emit(
    //   'password.reset.requested',
    //   new PasswordResetRequestedEvent(email, resetToken),
    // );
    await this.emailService.sendPasswordReset(email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded: JwtRestPasswordPayload = this.jwtService.verify(token);
      const user = await this.usersService.findOneById(decoded.sub);

      if (!user || user._id.toHexString() !== decoded.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      const hashedPassword = await PasswordHasher.hashPassword(newPassword);
      await this.usersService.updatePassword(user._id, hashedPassword);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

interface JwtRestPasswordPayload {
  sub: string;
  email: string;
}
