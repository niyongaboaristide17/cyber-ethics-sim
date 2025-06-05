import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class PasswordResetDto {
  @ApiProperty({
    example: 'your-jwt-token-here',
    description: 'Reset token received via email',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'NewP@ssw0rd!',
    description: 'New password (min 6 characters)',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword: string;
}
