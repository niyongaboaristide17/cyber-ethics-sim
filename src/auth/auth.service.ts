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

  /**
   * Validates a user by comparing the provided email and password.
   * @param email - User's email address.
   * @param password - User's plaintext password.
   * @returns Promise<UserDocument> if credentials are valid.
   * @throws UnauthorizedException if invalid credentials.
   */
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

  /**
   * Generates a JWT access token or partial token based on 2FA status.
   * @param user - The authenticated user document.
   * @returns Object containing accessToken or partialToken.
   */
  async signIn(user: UserDocument) {
    // Create JWT payload with user ID and 2FA flag
    const payload = {
      sub: user._id.toHexString(),
      is2FAValidated: !user.isTwoFactorAuthenticationEnabled,
    };

    // Update the user's last login timestamp
    await this.usersService.updateLastLogin(user._id);

    // If 2FA is disabled, issue full access token
    if (!user.isTwoFactorAuthenticationEnabled) {
      return { accessToken: this.jwtService.sign(payload) };
    }

    // If 2FA is enabled, issue short-lived partial token for next step
    return {
      partialToken: this.jwtService.sign(payload, { expiresIn: '5m' }),
    };
  }

  /**
   * Generates a password reset token and sends it to the user's email.
   * @param email - Email of the user requesting password reset.
   */
  async generateResetToken(email: string): Promise<void> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate a JWT token for password reset
    const payload = { sub: user._id.toHexString() };
    const resetToken = this.jwtService.sign(payload, {
      expiresIn: '15m', // Token valid for 15 minutes
    });

    // Send reset link via email
    await this.emailService.sendPasswordReset(email, resetToken);
  }

  /**
   * Resets the user's password using a valid token.
   * @param token - JWT reset token received by user.
   * @param newPassword - New password to set.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Verify and decode the JWT token
      const decoded: JwtRestPasswordPayload = this.jwtService.verify(token);

      // Find the user by the ID in the token
      const user = await this.usersService.findOneById(decoded.sub);

      // Ensure user exists and token matches the user
      if (!user || user._id.toHexString() !== decoded.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      // Hash the new password
      const hashedPassword = await PasswordHasher.hashPassword(newPassword);

      // Update the user's password in the database
      await this.usersService.updatePassword(user._id, hashedPassword);
    } catch (error) {
      // Catch errors like expired or malformed tokens
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

/**
 * Interface defining the structure of the JWT payload used during password reset.
 */
interface JwtRestPasswordPayload {
  sub: string; // User ID as subject
  email?: string; // Optional email field (not used here but could be included)
}
