import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { DefaultEntity } from 'src/entities/default-entity';
import { Diagram } from 'src/entities/diagram.entity';
import { SharedDiagram } from 'src/entities/shared-diagram.entity';
import {
  UserPreference,
  UserPreferencesDTO,
} from 'src/entities/user-preferences.entity';
import { VisionImpairment } from 'src/enums/vision-impairment';
import {
  Column,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  Entity,
} from 'typeorm';

@Entity('users')
export class User extends DefaultEntity {
  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'enum', enum: VisionImpairment })
  vision_impairment!: VisionImpairment;

  @OneToMany(() => Diagram, (diagram) => diagram.user)
  diagrams!: Diagram[];

  @OneToOne(() => UserPreference, (userPrefence) => userPrefence.user, {
    cascade: true,
  })
  @JoinColumn({ name: 'user_preferences_id' })
  preferences!: UserPreference;

  @OneToMany(() => SharedDiagram, (sharedDiagram) => sharedDiagram.user)
  shared_diagrams!: SharedDiagram[];

  @DeleteDateColumn({ nullable: true })
  @Exclude()
  deleted_at!: Date;

  @Column({ default: false })
  is_deleted!: boolean;
}

export class UserDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  vision_impairment: VisionImpairment;

  @ApiProperty()
  preferences: UserPreferencesDTO;

  static toDTO(user: User): UserDTO {
    const userDto = new UserDTO();
    userDto.id = user.id;
    userDto.name = user.name;
    userDto.email = user.email;
    userDto.vision_impairment = user.vision_impairment;
    userDto.preferences = UserPreferencesDTO.toDTO(user.preferences);
    return userDto;
  }
}
