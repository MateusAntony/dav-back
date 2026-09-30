import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import { SharedDiagram } from 'src/entities/shared-diagram.entity';
import { AccessPermission } from 'src/enums/access-permission';
import { randomBytes } from 'crypto';

const MAX_DIAGRAMS_PER_USER = 3;

@Injectable()
export class DiagramsService {
  constructor(
    @InjectRepository(Diagram)
    private diagramsRepository: Repository<Diagram>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(SharedDiagram)
    private sharedDiagramsRepository: Repository<SharedDiagram>,
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
    const ownDiagrams = diagrams.map((diagram) => {
      if (diagram.serialized_object) {
        diagram.serialized_object = deserializeFromBase64(
          diagram.serialized_object,
        );
      }
      return { ...DiagramDTO.toDTO(diagram), is_owner: true };
    });
    const receivedShares = await this.sharedDiagramsRepository.find({
      where: { user: { id: userId } },
      relations: ['diagram'],
    });
    const sharedDiagrams = receivedShares
      .filter((share) => !share.diagram.is_deleted)
      .map((share) => {
        const diagram = share.diagram;
        diagram.serialized_object = deserializeFromBase64(diagram.serialized_object);
        return { ...DiagramDTO.toDTO(diagram), is_owner: false };
      });
    return [...ownDiagrams, ...sharedDiagrams];
  }

  async findOne(id: string, userId: string): Promise<DiagramDTO | null> {
    const diagram = await this.diagramsRepository.findOne({
      where: { id: id, user: { id: userId } },
    });
    if (!diagram) {
      const share = await this.sharedDiagramsRepository.findOne({
        where: { diagram: { id }, user: { id: userId } },
        relations: ['diagram'],
      });
      if (!share || share.diagram.is_deleted) {
        throw new NotFoundException('Diagrama não encontrado');
      }
      share.diagram.serialized_object = deserializeFromBase64(share.diagram.serialized_object);
      return { ...DiagramDTO.toDTO(share.diagram), is_owner: false };
    }
    if (diagram.serialized_object) {
      diagram.serialized_object = deserializeFromBase64(
        diagram.serialized_object,
      );
    }
    return { ...DiagramDTO.toDTO(diagram), is_owner: true };
  }

  private async findOwned(id: string, userId: string): Promise<Diagram> {
    const diagram = await this.diagramsRepository.findOne({
      where: { id, user: { id: userId }, is_deleted: false },
    });
    if (!diagram) throw new NotFoundException('Diagrama não encontrado');
    return diagram;
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOwned(id, userId);
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
    const diagramToUpdate = await this.findOwned(id, userId);
    if (diagram.name) {
      diagramToUpdate.name = diagram.name;
    }
    if (diagram.serialized_object) {
      diagramToUpdate.serialized_object = serializeToBase64(
        diagram.serialized_object,
      );
    }
    await this.diagramsRepository.update(id, diagramToUpdate);
    if (diagramToUpdate.serialized_object) {
      diagramToUpdate.serialized_object = deserializeFromBase64(diagramToUpdate.serialized_object);
    }
    return DiagramDTO.toDTO(diagramToUpdate);
  }

  async setPublicShare(id: string, userId: string, enabled: boolean): Promise<DiagramDTO> {
    const diagram = await this.findOwned(id, userId);
    diagram.public_share_enabled = enabled;
    diagram.public_share_token = enabled
      ? diagram.public_share_token || randomBytes(32).toString('hex')
      : null;
    await this.diagramsRepository.save(diagram);
    return DiagramDTO.toDTO(diagram);
  }

  async getPublicDiagram(token: string): Promise<DiagramDTO> {
    const diagram = await this.diagramsRepository.findOne({
      where: { public_share_token: token, public_share_enabled: true, is_deleted: false },
    });
    if (!diagram) throw new NotFoundException('Link de compartilhamento inválido ou revogado');
    diagram.serialized_object = deserializeFromBase64(diagram.serialized_object);
    return DiagramDTO.toDTO(diagram);
  }

  async shareWithUser(id: string, ownerId: string, email: string): Promise<void> {
    const diagram = await this.findOwned(id, ownerId);
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuário não encontrado para este e-mail');
    if (user.id === ownerId) throw new BadRequestException('Não é possível compartilhar um diagrama com o proprietário');
    const existing = await this.sharedDiagramsRepository.findOne({
      where: { diagram: { id: diagram.id }, user: { id: user.id } },
    });
    if (!existing) {
      await this.sharedDiagramsRepository.save(this.sharedDiagramsRepository.create({
        diagram,
        user,
        access_permission: AccessPermission.VIEWER,
      }));
    }
  }

  async listShares(id: string, ownerId: string) {
    await this.findOwned(id, ownerId);
    const shares = await this.sharedDiagramsRepository.find({
      where: { diagram: { id } }, relations: ['user'], order: { created_at: 'DESC' },
    });
    return shares.map((share) => ({ id: share.id, email: share.user.email, name: share.user.name, access_permission: 'VIEWER' }));
  }

  async removeShare(id: string, shareId: string, ownerId: string): Promise<void> {
    await this.findOwned(id, ownerId);
    const share = await this.sharedDiagramsRepository.findOne({ where: { id: shareId, diagram: { id } } });
    if (!share) throw new NotFoundException('Compartilhamento não encontrado');
    await this.sharedDiagramsRepository.remove(share);
  }
}