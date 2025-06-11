import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as speakeasy from 'speakeasy'; // Library for generating and verifying TOTP tokens
import * as qrcode from 'qrcode'; // Library for generating QR codes

@Injectable()
export class TwoFactorService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Verifies a user's 2FA token after login.
   * If valid, issues a new JWT access token confirming 2FA validation.
   *
   * @param email - User's email address
   * @param token - One-time password (TOTP) entered by the user
   * @returns New JWT access token with 2FA flag set to true
   */
  async verifyTwoFactor(email: string, token: string) {
    const user = await this.userService.findOneByEmail(email);

    // Ensure user exists and has 2FA enabled with a stored secret
    if (
      !user ||
      !user.isTwoFactorAuthenticationEnabled ||
      !user.twoFactorSecret
    ) {
      throw new UnauthorizedException('2FA not configured');
    }

    // Verify the provided token against the user's 2FA secret
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }

    // Generate a new JWT with is2FAValidated flag set to true
    const payload = {
      sub: user._id.toHexString(),
      is2FAValidated: true,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  /**
   * Generates a TOTP secret and QR code for setting up 2FA.
   * This secret is temporarily or permanently stored in the user document.
   *
   * @param email - Email of the user enabling 2FA
   * @returns Secret, OTP auth URL, and QR code image data URL
   */
  async generateTwoFactorSecret(email: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate a new TOTP secret using speakeasy
    const secret = speakeasy.generateSecret({ name: `StarterApp:${email}` });

    if (!secret.otpauth_url) {
      throw new InternalServerErrorException('Failed to generate OTP URL');
    }

    // Save the base32 secret to the user document and mark 2FA as enabled
    await this.userService.enableTwoFactor(user._id, secret.base32);

    let qrCodeDataUrl: string;

    try {
      // Convert the OTP auth URL into a QR code (data URL format)
      qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate QR code');
    }

    // Return all necessary information to complete 2FA setup
    return {
      secret: secret.base32,
      url: secret.otpauth_url,
      qrCode: qrCodeDataUrl,
    };
  }
}
