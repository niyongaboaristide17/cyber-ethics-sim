import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TwoFactorAuthDto {
  @ApiProperty({
    example: '123456',
    description: 'TOTP token from authenticator app',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  readonly token: string;
}
