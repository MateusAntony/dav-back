import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import {
  CreateUserRequestDTO,
  UpdateUserRequestDTO,
} from 'src/interfaces/dto/users/user.request';
import { UsersService } from '../providers/users.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserPreferencesRequestDTO } from 'src/interfaces/dto/user-preferences/preferences.request';
import { UserDTO } from 'src/entities/user.entity';
import { UserPreferencesDTO } from 'src/entities/user-preferences.entity';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiResponse({ type: UserDTO })
  @Post()
  async create(
    @Body() createUserDto: CreateUserRequestDTO,
    @Res() res: Response,
  ) {
    const user = await this.usersService.create(createUserDto);
    return res.status(HttpStatus.CREATED).send(user);
  }

  @ApiResponse({ type: UserDTO })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findOne(@Res() res: Response, @Req() req: Request) {
    const userId = req.user['userId'];
    const user = await this.usersService.findOne(userId);
    return res.status(HttpStatus.OK).send(user);
  }

  @ApiResponse({ type: UserDTO })
  @UseGuards(AuthGuard('jwt'))
  @Put()
  async update(
    @Body() updateUserDto: UpdateUserRequestDTO,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userId = req.user['userId'];
    const updatedUser = await this.usersService.update(userId, updateUserDto);
    return res.status(HttpStatus.OK).send(updatedUser);
  }

  @ApiResponse({ type: UserPreferencesDTO })
  @UseGuards(AuthGuard('jwt'))
  @Put('/preferences/')
  async updatePreferences(
    @Body() updatePreferencesDto: UpdateUserPreferencesRequestDTO,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userId = req.user['userId'];
    const updatedPreferences = await this.usersService.updatePreferences(
      userId,
      updatePreferencesDto,
    );
    return res.status(HttpStatus.OK).send(updatedPreferences);
  }
}
