import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Diagram } from 'src/entities/diagram.entity';
import { DiagramsService } from 'src/providers/diagram.service';
import { DiagramsController, PublicDiagramsController } from 'src/controllers/diagrams.controller';
import { User } from 'src/entities/user.entity';
import { SharedDiagram } from 'src/entities/shared-diagram.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Diagram, User, SharedDiagram])],
  providers: [DiagramsService],
  controllers: [DiagramsController, PublicDiagramsController],
})
export class DiagramsModule {}
