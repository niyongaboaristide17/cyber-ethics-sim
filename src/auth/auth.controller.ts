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
import { GenerateTwoFactorSecretDto } from './dto/generate-two-factor-secret.dto';
import { AllowPartialToken } from '../common/decorators/allow-partial-token.decorator';
import { Public } from '../common/decorators/auth.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../types/user-request.interface';

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
  ) {
    const email = req.user.email;
    return this.twoFactorService.verifyTwoFactor(email, dto.token);
  }

  @Post('2fa/generate')
  async generate2faSecret(@Req() req: AuthenticatedRequest) {
    const email = req.user.email;
    return this.twoFactorService.generateTwoFactorSecret(email);
  }
}
