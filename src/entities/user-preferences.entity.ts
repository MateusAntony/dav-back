import { Entity, Column, OneToOne } from 'typeorm';
import { User } from 'src/entities/user.entity';
// import { InterfaceContrast } from '../enums/user-preferences';
import { DefaultEntity } from './default-entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Entity representing user preferences.
 * These preferences are set after a user is created. Default values for these preferences will be determined
 * based on the selected value of the visualImpairment enum.
 * For each case of the visualImpairment enum, a default object with these characteristics will be defined.
 */

@Entity('user_preferences')
export class UserPreference extends DefaultEntity {
  @Column()
  audio_description!: boolean;

  @Column({ nullable: true })
  audio_rate!: number;

  // @Column()
  // font_size!: string;

  // @Column({ type: 'enum', enum: InterfaceContrast })
  // interface_contrast!: InterfaceContrast;

  @OneToOne(() => User, (user) => user.preferences)
  user!: User;
}

export class UserPreferencesDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  audio_description: boolean;

  @ApiProperty()
  audio_rate?: number;

  // @ApiProperty()
  // font_size: string;

  // @ApiProperty({ enum: InterfaceContrast })
  // interface_contrast!: InterfaceContrast;

  static toDTO(preferences: UserPreference): UserPreferencesDTO {
    const preferencesDto = new UserPreferencesDTO();
    preferencesDto.id = preferences.id;
    preferencesDto.audio_description = preferences.audio_description;
    preferencesDto.audio_rate = preferences.audio_rate;
    // preferencesDto.font_size = preferences.font_size;
    // preferencesDto.interface_contrast = preferences.interface_contrast;
    return preferencesDto;
  }
}
