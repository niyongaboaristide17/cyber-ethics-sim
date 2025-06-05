import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The unique email address associated with the user account',
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd',
    description: 'The user’s password (minimum 6 characters)',
  })
  @IsString()
  readonly password: string;
}
