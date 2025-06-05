import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateTwoFactorSecretDto {
  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'Email of the user enabling 2FA',
  })
  @IsEmail()
  readonly email: string;
}
