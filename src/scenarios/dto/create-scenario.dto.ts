import {
  IsArray,
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class DecisionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  optionText: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  legalInsight?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ethicalInsight?: string;
}

export class CreateScenarioDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  context?: string;

  @ApiProperty({ type: [DecisionDto] })
  @IsArray()
  @Type(() => DecisionDto)
  decisions: DecisionDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  difficulty?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  createdBy?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isAIgenerated?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  editable?: boolean;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  publishedAt?: Date;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  educatorNotes?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sourceHeadline?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sourceUrl?: string;
}
