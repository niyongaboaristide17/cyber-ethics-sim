import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/SignIn.dto';
import { TwoFactorService } from './two-factor/two-factor.service';
import { TwoFactorAuthDto } from './dto/two-factor-auth.dto';
import { AllowPartialToken } from '../common/decorators/allow-partial-token.decorator';
import { Public } from '../common/decorators/auth.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../types/user-request.interface';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { PasswordResetDto } from './dto/password-reset.dto';

interface TwoFactorVerifyResponse {
  accessToken: string;
}

interface TwoFactorSetupResponse {
  secret: string;
  url: string;
  qrCode: string;
}

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() dto: SignInDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.signIn(user);
  }

  @AllowPartialToken()
  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  async verify2fa(
    @Body() dto: TwoFactorAuthDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<TwoFactorVerifyResponse> {
    const email = req.user.email;
    return this.twoFactorService.verifyTwoFactor(email, dto.token);
  }

  @Post('2fa/generate')
  async generate2faSecret(
    @Req() req: AuthenticatedRequest,
  ): Promise<TwoFactorSetupResponse> {
    const email = req.user.email;
    return this.twoFactorService.generateTwoFactorSecret(email);
  }

  @Public()
  @Post('request-password-reset')
  @ApiOperation({ summary: 'Request a password reset link' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
    await this.authService.generateResetToken(dto.email);
    return {
      message: 'Password reset link sent',
    };
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset the user password' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  async resetPassword(@Body() dto: PasswordResetDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
