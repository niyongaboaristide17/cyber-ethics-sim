import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';

import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class TwoFactorService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async verifyTwoFactor(email: string, token: string) {
    const user = await this.userService.findOneByEmail(email);
    if (
      !user ||
      !user.isTwoFactorAuthenticationEnabled ||
      !user.twoFactorSecret
    ) {
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

  async generateTwoFactorSecret(email: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const secret = speakeasy.generateSecret({ name: `StarterApp:${email}` });

    if (!secret.otpauth_url) {
      throw new InternalServerErrorException('Failed to generate OTP URL');
    }

    await this.userService.enableTwoFactor(user._id, secret.base32);

    let qrCodeDataUrl: string;

    try {
      qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);
    } catch {
      throw new InternalServerErrorException('Failed to generate QR code');
    }

    return {
      secret: secret.base32,
      url: secret.otpauth_url,
      qrCode: qrCodeDataUrl,
    };
  }
}
