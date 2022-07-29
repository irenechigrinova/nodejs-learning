import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AccessTokenGuard } from '../core/guards/access-token.guard';

import PermissionEntity from './permission.entity';
import { PermissionDto } from './permission.dto';

@Controller('permissions')
export class PermissionController {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  async createPermission(@Body() data: PermissionDto) {
    const permission = new PermissionEntity();
    const newPermission: PermissionEntity = {
      ...permission,
      ...data,
    };

    await this.permissionRepository.save(newPermission);
    return newPermission;
  }

  @UseGuards(AccessTokenGuard)
  @Put(':id')
  async updatePermission(@Param('id') id: number, data: PermissionDto) {
    let permissionToUpdate: PermissionEntity | null =
      await this.permissionRepository.findOneBy({
        id,
      });
    if (!permissionToUpdate) return undefined;

    permissionToUpdate = {
      ...permissionToUpdate,
      ...data,
    };
    await this.permissionRepository.save(permissionToUpdate);
    return permissionToUpdate;
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  async deletePermission(@Param('id') id: number) {
    const permissionToDelete: PermissionEntity | null =
      await this.permissionRepository.findOneBy({
        id,
      });
    if (!permissionToDelete) return undefined;

    await this.permissionRepository.delete(id);
    return true;
  }

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  async getPermissionById(@Param('id') id: number) {
    const result = await this.permissionRepository.findOneBy({
      id,
    });
    return result || undefined;
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  async getAllPermissions() {
    return this.permissionRepository.find();
  }
}
