import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Diagram, DiagramDTO } from 'src/entities/diagram.entity';
import {
  CreateDiagramRequestDTO,
  UpdateDiagramRequestDTO,
} from 'src/interfaces/dto/diagrams/diagrams.request';
import {
  deserializeFromBase64,
  serializeToBase64,
} from 'src/utils/base64.handler';
import { User } from 'src/entities/user.entity';

const MAX_DIAGRAMS_PER_USER = 3;

@Injectable()
export class DiagramsService {
  constructor(
    @InjectRepository(Diagram)
    private diagramsRepository: Repository<Diagram>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async create(
    diagram: CreateDiagramRequestDTO,
    userId: string,
  ): Promise<DiagramDTO> {
    const activeDiagramsCount = await this.diagramsRepository.count({
      where: { user: { id: userId }, is_deleted: false },
    });
    if (activeDiagramsCount >= MAX_DIAGRAMS_PER_USER) {
      throw new BadRequestException(
        `Limite de ${MAX_DIAGRAMS_PER_USER} diagramas por usuário atingido.`,
      );
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });
      if (diagram.serialized_object) {
        diagram.serialized_object = serializeToBase64(
          diagram.serialized_object,
        );
      }
      const createdDiagram = queryRunner.manager.create(Diagram, {
        user,
        ...diagram,
      });
      const savedDiagram = await queryRunner.manager.save(
        Diagram,
        createdDiagram,
      );
      await queryRunner.commitTransaction();
      return DiagramDTO.toDTO(savedDiagram);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId: string): Promise<DiagramDTO[]> {
    const diagrams = await this.diagramsRepository.find({
      where: { user: { id: userId }, is_deleted: false },
    });
    return diagrams.map((diagram) => {
      if (diagram.serialized_object) {
        diagram.serialized_object = deserializeFromBase64(
          diagram.serialized_object,
        );
      }
      return DiagramDTO.toDTO(diagram);
    });
  }

  async findOne(id: string, userId: string): Promise<DiagramDTO | null> {
    const diagram = await this.diagramsRepository.findOne({
      where: { id: id, user: { id: userId } },
    });
    if (!diagram) {
      throw new Error('Usuário não encontrado');
    }
    if (diagram.serialized_object) {
      diagram.serialized_object = deserializeFromBase64(
        diagram.serialized_object,
      );
    }
    return DiagramDTO.toDTO(diagram);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    const currentDate = new Date().toISOString();
    await this.diagramsRepository.update(id, {
      is_deleted: true,
      deleted_at: currentDate,
    });
  }

  async update(
    id: string,
    userId: string,
    diagram: UpdateDiagramRequestDTO,
  ): Promise<DiagramDTO> {
    const diagramToUpdate = await this.findOne(id, userId);
    if (diagram.name) {
      diagramToUpdate.name = diagram.name;
    }
    if (diagram.serialized_object) {
      diagramToUpdate.serialized_object = serializeToBase64(
        diagram.serialized_object,
      );
    }
    await this.diagramsRepository.update(id, diagramToUpdate);
    return diagramToUpdate;
  }
}
