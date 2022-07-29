import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import PermissionEntity from '../permission/permission.entity';
import GroupEntity from './group.entity';
import UserEntity from '../user/user.entity';

import { GroupDto } from './group.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  private async toJson(group: GroupEntity | GroupEntity[]) {
    const permissions = await this.permissionRepository.find();
    let data;
    if (Array.isArray(group)) {
      data = group.map((item) => ({
        ...item,
        permissions: item.permissions.map((permission) => permission.id),
      }));
    } else {
      data = {
        ...group,
        permissions: group.permissions.map((permission) => permission.id),
      };
    }
    return { data, meta: { permissions } };
  }

  async createGroup(data: GroupDto) {
    const permissions = await this.permissionRepository.find({
      where: {
        id: In(data.permissionsIds),
      },
    });
    const newGroup = new GroupEntity();
    const groupToSave = {
      ...newGroup,
      name: data.name,
      permissions,
    };

    await this.groupRepository.save(groupToSave);
    return this.toJson(groupToSave);
  }

  async updateGroup(id: number, data: GroupDto) {
    const groupToUpdate = await this.groupRepository.findOne({
      where: {
        id,
      },
      relations: ['permissions', 'users'],
    });
    if (groupToUpdate) {
      const permissions = await this.permissionRepository.find({
        where: {
          id: In(data.permissionsIds),
        },
      });
      const newGroup = {
        ...groupToUpdate,
        name: data.name,
        permissions,
      };
      await this.groupRepository.save(newGroup);
      return this.toJson(newGroup);
    }
    return undefined;
  }

  async deleteGroup(id: number) {
    const groupToDelete = await this.groupRepository.findOneBy({
      id,
    });
    return groupToDelete ? { success: true } : undefined;
  }

  async getGroupById(id: number) {
    const result = await this.groupRepository.findOne({
      where: {
        id,
      },
      relations: ['permissions', 'users'],
    });
    return result ? this.toJson(result) : undefined;
  }

  async getAllGroups() {
    const groups = await this.groupRepository.find({
      relations: ['permissions', 'users'],
    });
    return this.toJson(groups);
  }

  async manageGroupUsers(usersIds: number[], groupId: number) {
    const group = await this.groupRepository.findOne({
      where: {
        id: groupId,
      },
      relations: ['permissions', 'users'],
    });

    if (!group) return undefined;

    const users = await this.userRepository.find({
      where: {
        id: In(usersIds),
      },
      relations: ['groups'],
    });

    group.users = [...users];
    return this.groupRepository.save(group);
  }
}
