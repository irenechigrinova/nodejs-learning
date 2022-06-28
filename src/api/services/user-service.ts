import { DataSource, QueryRunner } from 'typeorm';

import { TUser } from '../types/user.types';
import { TGroup } from '../types/group.types';
import { TRepository } from '../types/common.types';

class UserService {
  readonly repository: TRepository;

  private groupRepository: TRepository;

  private appDataSource: DataSource;

  private queryRunner: QueryRunner;

  constructor(
    userRepository: TRepository,
    groupRepository: TRepository,
    appDataSource: DataSource
  ) {
    this.repository = userRepository;
    this.groupRepository = groupRepository;
    this.appDataSource = appDataSource;
    this.queryRunner = appDataSource.createQueryRunner();
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
    return newUser ? this.toJson(newUser) : undefined;
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
    return updatedUser ? this.toJson(updatedUser) : undefined;
  }

  async softDeleteUser(userId: number) {
    return this.repository.findByIdAndDelete(userId);
  }

  async getUserById(userId: number) {
    const user = await this.repository.findById(userId);
    return user ? this.toJson(user) : undefined;
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

    await this.queryRunner.startTransaction();

    let result;

    try {
      // eslint-disable-next-line no-restricted-syntax
      for await (const user of users) {
        const hasGroup = user.groups.find(
          (group: TGroup) => group.id === +groupId
        );
        if (!hasGroup && group) {
          user.groups = [...user.groups, group];
        }
        await this.queryRunner.manager.save(user);
      }
      await this.queryRunner.commitTransaction();
      result = await this.toJson(users);
    } catch (err) {
      await this.queryRunner.rollbackTransaction();
      result = {
        error: 'Something went wrong',
        details: err,
      };
    } finally {
      await this.queryRunner.release();
    }
    return result;
  }

  async removeUsersFromGroup(usersIds: number[], groupId: number) {
    const users = await this.repository.findAllUsersById(usersIds);

    await this.queryRunner.startTransaction();

    let result;

    try {
      // eslint-disable-next-line no-restricted-syntax
      for await (const user of users) {
        user.groups = user.groups.filter(
          (group: TGroup) => group.id !== +groupId
        );
        await this.queryRunner.manager.save(user);
      }
      await this.queryRunner.commitTransaction();
      result = await this.toJson(users);
    } catch (err) {
      await this.queryRunner.rollbackTransaction();
      result = {
        error: 'Something went wrong',
        details: err,
      };
    } finally {
      await this.queryRunner.release();
    }
    return result;
  }
}

export default UserService;
