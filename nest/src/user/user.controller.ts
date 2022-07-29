import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';

import { AccessTokenGuard } from '../core/guards/access-token.guard';

import { UserService } from './user.service';
import { EncryptionService } from '../core/encryption/encryption';
import { UserPostDto, UserPutDto } from './user.dto';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private encryptionService: EncryptionService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  async createUser(@Body() data: UserPostDto) {
    const hashedPassword = await this.encryptionService.hashData(data.password);

    const newUser = await this.userService.createUser({
      ...data,
      password: hashedPassword,
    });
    if (!newUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    return newUser;
  }

  @UseGuards(AccessTokenGuard)
  @Put(':id')
  async updateUser(@Param('id') id: number, @Body() data: UserPutDto) {
    const updatedUser = await this.userService.updateUser(id, data);
    return updatedUser || undefined;
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  async softDeleteUser(@Param('id') id: number) {
    const result = await this.userService.softDeleteUser(id);
    return result ? { success: true } : undefined;
  }

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  async getUserById(@Param('id') id: number) {
    const result = await this.userService.getUserById(id);
    return result || undefined;
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  async getUsers(@Query() query: Record<string, string>) {
    const limit = query.limit ? +query.limit : 10;
    const offset = query.offset ? +query.offset : 0;
    const login = query.login?.toLowerCase() || '';
    const { data, meta, total } = await this.userService.getUsers(
      login,
      limit,
      offset,
    );
    return {
      users: data,
      meta,
      pagination: {
        limit,
        offset,
        total,
      },
    };
  }
}
