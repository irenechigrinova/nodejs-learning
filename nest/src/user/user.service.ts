import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';

import UserEntity from './user.entity';
import GroupEntity from '../group/group.entity';
import { UserPostDto, UserPutDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
  ) {}

  private async toJson(user: UserEntity | UserEntity[]) {
    const groups = await this.groupRepository.find({
      relations: ['permissions', 'users'],
    });
    let data;
    if (Array.isArray(user)) {
      data = user.map((item) => ({
        ...item,
        groups: item.groups.map((group) => group.id),
      }));
    } else {
      data = {
        ...user,
        groups: user.groups.map((group) => group.id),
      };
    }
    return {
      data,
      meta: {
        groups: groups.map((group) => ({
          name: group.name,
          id: group.id,
        })),
      },
    };
  }

  async createUser(data: UserPostDto) {
    const userExists = await this.userRepository.findOneBy({
      login: data.login,
    });
    if (userExists) {
      return undefined;
    }

    const groups = await this.groupRepository.find({
      where: {
        id: In(data.groupsIds),
      },
    });
    const user = new UserEntity();
    const newUser = {
      ...user,
      ...data,
      groups,
    };
    await this.userRepository.save(newUser);
    delete newUser.deletedAt;
    delete newUser.password;
    delete newUser.refreshToken;
    return this.toJson(newUser);
  }

  async updateUser(id: number, data: UserPutDto) {
    const userToUpdate = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: ['groups'],
    });
    if (userToUpdate) {
      const groups = await this.groupRepository.find({
        where: {
          id: In(data.groupsIds),
        },
      });
      delete data.groupsIds;
      const newUser = {
        ...userToUpdate,
        ...data,
        groups,
      };
      await this.userRepository.save(newUser);
      delete newUser.deletedAt;
      delete newUser.password;
      delete newUser.refreshToken;
      return this.toJson(newUser);
    }
    return undefined;
  }

  async softDeleteUser(id: number) {
    const userToDelete = await this.userRepository.findOneBy({
      id,
    });
    if (userToDelete) {
      await this.userRepository.softDelete(id);
      return true;
    }
    return false;
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: ['groups'],
    });
    return user ? this.toJson(user) : undefined;
  }

  async getUsers(login: string, limit: number, offset: number) {
    const [users, total] = await this.userRepository.findAndCount({
      order: {
        login: 'ASC',
      },
      skip: offset,
      take: limit,
      where: {
        login: ILike(`${login}%`),
      },
      relations: ['groups'],
    });
    const json = await this.toJson(users);
    return { ...json, total };
  }
}
