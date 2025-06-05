import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = (await this.userService.findOneById(
      payload.sub,
    )) as UserDocument;

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      _id: user._id,
      email: user.email,
      claims: user.claims,
      isSuperuser: user.isSuperuser,
      isTwoFactorAuthenticationEnabled: user.isTwoFactorAuthenticationEnabled,
      is2FAValidated: payload.is2FAValidated ?? false,
    };
  }
}

interface JwtPayload {
  sub: string;
  is2FAValidated?: boolean;
}
