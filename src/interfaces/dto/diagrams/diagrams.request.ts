import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDiagramRequestDTO {

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name!: string;


  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  serialized_object!: string;
}

export class UpdateDiagramRequestDTO {

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;


  @ApiProperty()
  @IsOptional()
  @IsString()
  serialized_object?: string;
}
