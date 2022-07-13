import { DataSource, QueryRunner } from 'typeorm';

import { TUser } from '../types/user.types';
import { TGroup } from '../types/group.types';
import { TRepository } from '../types/common.types';

class UserService {
  readonly repository: TRepository;

  private groupRepository: TRepository;

  private appDataSource: DataSource;

  constructor(
    userRepository: TRepository,
    groupRepository: TRepository,
    appDataSource: DataSource
  ) {
    this.repository = userRepository;
    this.groupRepository = groupRepository;
    this.appDataSource = appDataSource;
  }

  private async toJson(user: TUser | TUser[]) {
    const groups = await this.groupRepository.findAll();
    let data;
    if (Array.isArray(user)) {
      data = user.map((item) => ({
        ...item,
        groups: item.groups.map((group) => (group as unknown as TGroup).id),
      }));
    } else {
      data = {
        ...user,
        groups: user.groups.map((group) => (group as unknown as TGroup).id),
      };
    }
    return {
      data,
      meta: {
        groups: groups.map((group: TGroup) => ({
          name: group.name,
          id: group.id,
        })),
      },
    };
  }

  async createUser(user: Partial<TUser> & { groupsIds: number[] }) {
    const { login, password, age, groupsIds } = user;
    const groups = await this.groupRepository.findAllGroupsById(groupsIds);
    const newUser = await this.repository.create({
      login,
      password,
      age,
      groups,
    });
    if (newUser) {
      delete newUser.password;
      return this.toJson(newUser);
    }
    return undefined;
  }

  async updateUser(
    userId: number,
    params: Partial<TUser> & { groupsIds?: number[] }
  ) {
    if (params.groupsIds) {
      params.groups = await this.groupRepository.findAllGroupsById(
        params.groupsIds
      );
      delete params.groupsIds;
    }
    const updatedUser = await this.repository.findByIdAndUpdate(userId, params);
    if (updatedUser) {
      delete updatedUser.password;
      return this.toJson(updatedUser);
    }
    return undefined;
  }

  async softDeleteUser(userId: number) {
    return this.repository.findByIdAndDelete(userId);
  }

  async getUserById(userId: number) {
    const user = await this.repository.findById(userId);
    return user ? this.toJson(user) : undefined;
  }

  async getUserByLogin(login: string) {
    const user = await this.repository.findByLogin(login);
    return user || undefined;
  }

  async getUsers(login: string, limit: number, offset: number) {
    const { data, total } = await this.repository.findByParams(
      login,
      limit,
      offset
    );
    const json = await this.toJson(data);
    return { ...json, total };
  }

  async addUsersToGroup(usersIds: number[], groupId: number) {
    const users = await this.repository.findAllUsersById(usersIds);
    const group = await this.groupRepository.findById(groupId);

    const queryRunner = this.appDataSource.createQueryRunner();

    await queryRunner.startTransaction();
    let result;

    try {
      group.users = [...group.users, ...users];
      await queryRunner.manager.save(group);
      await queryRunner.commitTransaction();
      result = await this.toJson(
        users.map((user: TUser) => ({
          ...user,
          groups: [...user.groups, group],
        }))
      );
    } catch (err) {
      await queryRunner.rollbackTransaction();
      result = {
        error: 'Something went wrong',
        details: err,
      };
    } finally {
      await queryRunner.release();
    }
    return result;
  }

  async removeUsersFromGroup(usersIds: number[], groupId: number) {
    const users = await this.repository.findAllUsersById(usersIds);
    const group = await this.groupRepository.findById(groupId);
    const queryRunner = this.appDataSource.createQueryRunner();

    await queryRunner.startTransaction();

    let result;

    try {
      group.users = group.users.filter(
        (user: TUser) => !usersIds.includes(user.id)
      );
      await queryRunner.manager.save(group);
      await queryRunner.commitTransaction();
      result = await this.toJson(
        users.map((user: TUser) => ({
          ...user,
          groups: user.groups.filter(({ id }) => id !== groupId),
        }))
      );
    } catch (err) {
      await queryRunner.rollbackTransaction();
      result = {
        error: 'Something went wrong',
        details: err,
      };
    } finally {
      await queryRunner.release();
    }
    return result;
  }
}

export default UserService;
