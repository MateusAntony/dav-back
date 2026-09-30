import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ShareDiagramWithUserRequestDTO {
  @ApiProperty({ example: 'colega@exemplo.com' })
  @IsEmail()
  email!: string;
}

export class SetPublicShareRequestDTO {
  @ApiProperty({ example: true })
  @IsNotEmpty()
  enabled!: boolean;
}

export class PublicDiagramParams {
  @IsString()
  @IsNotEmpty()
  token!: string;
}
