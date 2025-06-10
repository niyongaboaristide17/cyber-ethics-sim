import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { UserDocument } from '../../users/schemas/user.schema';

/**
 * JwtStrategy is a Passport strategy for handling JWT-based authentication.
 * It validates incoming JWT tokens and maps them to a user object.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Initializes the JWT strategy by reading configuration and setting up the strategy options.
   * @param configService - For accessing environment variables (e.g., JWT secret).
   * @param userService - For fetching user data based on the token payload.
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    // Ensure that JWT_SECRET is defined in the environment
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // Initialize the Passport JWT strategy with configuration options
    super({
      // How to extract the JWT from the request (Bearer token in Authorization header)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Do NOT allow expired tokens
      ignoreExpiration: false,

      // The secret key used to verify the token's signature
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Validates the JWT payload and returns user information to be attached to the request.
   * This method is automatically called by Passport after the token is verified.
   *
   * @param payload - The decoded JWT payload (typically includes `sub`, expiration, etc.)
   * @returns An object containing user-related claims for use in protected routes.
   * @throws UnauthorizedException if user is not found or is inactive.
   */
  async validate(payload: JwtPayload) {
    // Fetch the user from the database using the ID from the token payload
    const user = (await this.userService.findOneById(
      payload.sub,
    )) as UserDocument;

    // If user doesn't exist or is not active, throw an unauthorized error
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Return essential user data to be attached to the request object
    return {
      _id: user._id,
      email: user.email,
      claims: user.claims,
      isSuperuser: user.isSuperuser,
      isTwoFactorAuthenticationEnabled: user.isTwoFactorAuthenticationEnabled,
      is2FAValidated: payload.is2FAValidated ?? false, // Optional flag for 2FA state
    };
  }
}

/**
 * Interface representing the structure of the JWT payload.
 * This should match what was used when signing the token.
 */
interface JwtPayload {
  sub: string; // Unique identifier of the user (subject)
  is2FAValidated?: boolean; // Optional flag indicating if 2FA has been validated
}
