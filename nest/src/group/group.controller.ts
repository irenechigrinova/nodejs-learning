import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';

import { AccessTokenGuard } from '../core/guards/access-token.guard';

import { GroupService } from './group.service';

import { GroupDto } from './group.dto';
import { UserGroupDto } from '../user/user.dto';

@Controller('groups')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  async createGroup(@Body() data: GroupDto) {
    return this.groupService.createGroup(data);
  }

  @UseGuards(AccessTokenGuard)
  @Put(':id')
  async updateGroup(@Param('id') id: number, @Body() data: GroupDto) {
    const updatedGroup = await this.groupService.updateGroup(id, data);
    return updatedGroup || undefined;
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  async deleteGroup(@Param('id') id: number) {
    const deletedGroup = await this.groupService.deleteGroup(id);
    return deletedGroup ? { success: true } : undefined;
  }

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  async getGroupById(@Param('id') id: number) {
    const result = await this.groupService.getGroupById(id);
    return result || undefined;
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  async getAllGroups() {
    return this.groupService.getAllGroups();
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id/users')
  async manageGroupUsers(@Param('id') id: number, @Body() data: UserGroupDto) {
    const result = await this.groupService.manageGroupUsers(data.usersIds, id);
    return result || undefined;
  }
}
