import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Diagram } from './diagram.entity';
import { User } from './user.entity';
import { AccessPermission } from 'src/enums/access-permission';
import { DefaultEntity } from './default-entity';

/** A direct invitation. The product currently exposes viewer-only sharing. */
@Entity('shared_diagrams')
@Unique(['diagram', 'user'])
export class SharedDiagram extends DefaultEntity {
  @Column({ type: 'enum', enum: AccessPermission, default: AccessPermission.VIEWER })
  access_permission!: AccessPermission;

  @ManyToOne(() => Diagram, (diagram) => diagram.shared_diagrams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'diagram_id' })
  diagram!: Diagram;

  @ManyToOne(() => User, (user) => user.shared_diagrams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
