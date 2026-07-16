import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDiagramRequestDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  serialized_object!: string;
}

export class UpdateDiagramRequestDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  serialized_object!: string;
}
