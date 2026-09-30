import {
  Entity,
  Column,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
// import { SharedDiagram } from './shared-diagram.entity';
import { DefaultEntity } from './default-entity';
import { User } from 'src/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { SharedDiagram } from './shared-diagram.entity';

@Entity('diagrams')
export class Diagram extends DefaultEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  name!: string;

  @Column({ type: 'text' })
  serialized_object!: string;

  @ManyToOne(() => User, (user) => user.diagrams)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @DeleteDateColumn({ nullable: true })
  deleted_at!: Date;

  @Column({ default: false })
  is_deleted!: boolean;

  @Column({ default: false })
  public_share_enabled!: boolean;

  @Column({ type: 'varchar', length: 96, nullable: true, unique: true })
  public_share_token!: string | null;

  @OneToMany(() => SharedDiagram, (sharedDiagram) => sharedDiagram.diagram)
  shared_diagrams!: SharedDiagram[];
}

export class DiagramDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  serialized_object: string;

  @ApiProperty({ required: false })
  public_share_enabled?: boolean;

  @ApiProperty({ required: false })
  public_share_token?: string | null;

  @ApiProperty({ required: false })
  is_owner?: boolean;

  // @ApiProperty()
  // shared_diagrams: UserPreferencesDTO;

  static toDTO(diagram: Diagram): DiagramDTO {
    const diagramDto = new DiagramDTO();
    diagramDto.id = diagram.id;
    diagramDto.name = diagram.name;
    diagramDto.serialized_object = diagram.serialized_object;
    diagramDto.public_share_enabled = diagram.public_share_enabled;
    diagramDto.public_share_token = diagram.public_share_token;

    return diagramDto;
  }
}
