import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  @Transform(({ value }) => value.trim())
  password: string;

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  lastName?: string;
} 