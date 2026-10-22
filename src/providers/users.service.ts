import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User, UserDTO } from '../entities/user.entity';
import {
  CreateUserRequestDTO,
  UpdateUserRequestDTO,
} from '../interfaces/dto/users/user.request';
import { PasswordsService } from './password.service';
import {
  UserPreference,
  UserPreferencesDTO,
} from 'src/entities/user-preferences.entity';
import { VisionImpairment } from 'src/enums/vision-impairment';
import { UpdateUserPreferencesRequestDTO } from 'src/interfaces/dto/user-preferences/preferences.request';
// import { FontSizeRange, InterfaceContrast } from 'src/enums/user-preferences';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserPreference)
    private preferencesRepository: Repository<UserPreference>,
    private readonly passwordService: PasswordsService,
    private dataSource: DataSource,
  ) {}

  configUserPreferences(
    severity: VisionImpairment,
  ): Partial<UserPreferencesDTO> {
    const defaultPreferences: Partial<UserPreferencesDTO> = {
      audio_description: false,
      audio_rate: null,
      // font_size: FontSizeRange.DEFAULT,
      // interface_contrast: InterfaceContrast.DEFAULT,
    };

    // const preferencesMap: Record<
    //   VisionImpairment,
    //   Partial<UserPreferencesDTO>
    // > = {
    //   [VisionImpairment.NONE]: {},
    //   [VisionImpairment.MILD]: { font_size: FontSizeRange.MILD },
    //   [VisionImpairment.MODERATE]: { font_size: FontSizeRange.MODERATE },
    //   [VisionImpairment.NEAR]: { font_size: FontSizeRange.NEAR },
    //   [VisionImpairment.SEVERE]: {
    //     audio_description: true,
    //     font_size: FontSizeRange.SEVERE,
    //     interface_contrast: InterfaceContrast.HIGH_CONTRAST_BLACK_WHITE,
    //   },
    //   [VisionImpairment.BLINDNESS]: { audio_description: true },
    // };

    const preferencesMap: Record<
      VisionImpairment,
      Partial<UserPreferencesDTO>
    > = {
      [VisionImpairment.NONE]: {},
      [VisionImpairment.MILD]: {},
      [VisionImpairment.MODERATE]: {},
      [VisionImpairment.NEAR]: { audio_description: true },
      [VisionImpairment.SEVERE]: {
        audio_description: true,
      },
      [VisionImpairment.BLINDNESS]: { audio_description: true },
    };

    return { ...defaultPreferences, ...preferencesMap[severity] };
  }

  async create(user: CreateUserRequestDTO): Promise<UserDTO> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (
        await this.usersRepository.findOne({
          where: { email: user.email },
          relations: ['diagrams', 'preferences'],
          cache: false,
        })
      ) {
        throw new Error('Email já cadastrado');
      }
      user.password = await this.passwordService.hashPassword(user.password);
      const createdUser = queryRunner.manager.create(User, user);

      const preferences = this.configUserPreferences(
        createdUser.vision_impairment,
      );
      const createdPreferences = queryRunner.manager.create(UserPreference, {
        user_id: createdUser.id,
        ...preferences,
      });

      const savedPreferences = await queryRunner.manager.save(
        UserPreference,
        createdPreferences,
      );
      createdUser.preferences = savedPreferences;
      await queryRunner.manager.save(User, createdUser);
      await queryRunner.commitTransaction();
      return UserDTO.toDTO(createdUser);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<UserDTO[]> {
    const users = await this.usersRepository.find({
      relations: ['diagrams', 'preferences'],
    });
    return users.map((user) => UserDTO.toDTO(user));
  }

  async findOne(id: string): Promise<UserDTO | null> {
    const user = await this.usersRepository.findOne({
      where: { id: id },
      relations: ['diagrams', 'preferences'],
    });
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    return UserDTO.toDTO(user);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    const currentDate = new Date().toISOString();
    await this.usersRepository.update(id, {
      is_deleted: true,
      deleted_at: currentDate,
    });
  }

  async update(id: string, user: UpdateUserRequestDTO): Promise<UserDTO> {
    const userToUpdate = await this.findOne(id);

    userToUpdate.name = user.name;
    userToUpdate.email = user.email;
    userToUpdate.vision_impairment = user.vision_impairment;

    await this.usersRepository.update(id, userToUpdate);
    return userToUpdate;
  }

  async updatePreferences(
    id: string,
    preferences: UpdateUserPreferencesRequestDTO,
  ): Promise<UserPreferencesDTO> {
    const preferencesToUpdate = await this.preferencesRepository.findOneBy({
      id,
    });

    if (!preferencesToUpdate) {
      throw new Error('Preferências não encontradas');
    }

    preferencesToUpdate.audio_description = preferences.audio_description;
    preferencesToUpdate.audio_rate = preferences.audio_rate;
    // preferencesToUpdate.font_size = preferences.font_size;
    // preferencesToUpdate.interface_contrast = preferences.interface_contrast;

    await this.preferencesRepository.update(id, preferencesToUpdate);
    return UserPreferencesDTO.toDTO(preferencesToUpdate);
  }
}
