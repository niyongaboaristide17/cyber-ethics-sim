import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  ArrayUnique,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Claim } from '../../common/enums/claim.enum';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @Transform(({ value }: { value: string }) => value.trim())
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isStaff?: boolean;

  @ApiProperty({
    enum: Claim,
    isArray: true,
    example: [Claim.VIEW_PROFILE],
    required: false,
  })
  @IsArray()
  @ArrayUnique()
  @IsEnum(Claim, { each: true })
  @IsOptional()
  claims?: Claim[];

  @ApiProperty({ example: 'This is my bio.', required: false })
  @IsString()
  @IsOptional()
  bio?: string;
}
