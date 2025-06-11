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

interface TwoFactorVerifyResponse {
  accessToken: string;
}

interface TwoFactorSetupResponse {
  secret: string;
  url: string;
  qrCode: string;
}

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
   * @throws {UnauthorizedException} When 2FA is not configured or token is invalid
   * @throws {NotFoundException} When user is not found
   */
  async verifyTwoFactor(
    email: string,
    token: string,
  ): Promise<TwoFactorVerifyResponse> {
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isTwoFactorAuthenticationEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException('2FA not configured');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }

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
   * @throws {NotFoundException} When user is not found
   * @throws {InternalServerErrorException} When OTP URL generation fails or QR code generation fails
   */
  async generateTwoFactorSecret(
    email: string,
  ): Promise<TwoFactorSetupResponse> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const secret = speakeasy.generateSecret({ name: `StarterApp:${email}` });

    if (!secret.otpauth_url) {
      throw new InternalServerErrorException('Failed to generate OTP URL');
    }

    try {
      await this.userService.enableTwoFactor(user._id, secret.base32);
    } catch (error) {
      throw new InternalServerErrorException('Failed to enable 2FA for user');
    }

    let qrCodeDataUrl: string;
    try {
      qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate QR code');
    }

    return {
      secret: secret.base32,
      url: secret.otpauth_url,
      qrCode: qrCodeDataUrl,
    };
  }
}
