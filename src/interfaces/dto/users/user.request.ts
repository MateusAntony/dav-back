import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEmail,
} from 'class-validator';
import { VisionImpairment } from 'src/enums/vision-impairment';

export class CreateUserRequestDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({})
  email!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(VisionImpairment)
  vision_impairment!: VisionImpairment;
}

export class UpdateUserRequestDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({})
  email!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(VisionImpairment)
  vision_impairment!: VisionImpairment;
}
