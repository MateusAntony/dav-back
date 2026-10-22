import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../providers/users.service';
import { User } from '../entities/user.entity';
import { PasswordsService } from '../providers/password.service';
import { UserPreference } from 'src/entities/user-preferences.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPreference])],
  providers: [UsersService, PasswordsService],
  controllers: [UsersController],
})
export class UsersModule {}
