import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/auth.decorator';
import { ALLOW_PARTIAL_TOKEN_KEY } from '../decorators/allow-partial-token.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public (no auth needed)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true; // skip auth
    }

    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized');
    }

    const allowPartialToken = this.reflector.getAllAndOverride<boolean>(
      ALLOW_PARTIAL_TOKEN_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (user.is2FAValidated === false && !allowPartialToken) {
      throw new UnauthorizedException('2FA validation required');
    }

    return user;
  }
}
