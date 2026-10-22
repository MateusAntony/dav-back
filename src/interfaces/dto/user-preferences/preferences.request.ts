import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty } from 'class-validator';
// import { InterfaceContrast } from 'src/enums/user-preferences';

export class UpdateUserPreferencesRequestDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  audio_description!: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  audio_rate!: number;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsString()
  // font_size!: string;

  // @ApiProperty()
  // @IsNotEmpty()
  // @IsEnum(InterfaceContrast)
  // interface_contrast!: InterfaceContrast;
}
