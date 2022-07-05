import { DataSource } from 'typeorm';

import {
  UserRepositoryStub,
  GroupRepositoryStub,
  AppDataSourceStub,
} from '../stubs/stubs';

import UserService from '../services/user-service';

import { TUser } from '../types/user.types';
import { TRepository } from '../types/common.types';

describe('User Service', () => {
  const userService = new UserService(
    UserRepositoryStub as unknown as TRepository,
    GroupRepositoryStub as unknown as TRepository,
    AppDataSourceStub as unknown as DataSource
  );

  const mockUser = {
    login: 'test',
    age: 20,
    password: 'qwerty76',
    groupsIds: [1],
  };

  afterEach(() => {
    UserRepositoryStub.reset();
  });

  it('should create user', async () => {
    const newUser = await userService.createUser(mockUser);
    expect(newUser).toBeTruthy();
    expect((newUser?.data as unknown as TUser).id).toBeTruthy();
    expect((newUser?.data as unknown as TUser).login).toBe(mockUser.login);
    expect((newUser?.data as unknown as TUser).age).toBe(mockUser.age);
    expect((newUser?.data as unknown as TUser).groups).toBeTruthy();
    expect(newUser?.meta).toBeTruthy();
  });

  it('should not create user with same login', async () => {
    await userService.createUser(mockUser);
    const newUserForTest = await userService.createUser(mockUser);
    expect(newUserForTest).toBeFalsy();
  });

  it('should update user', async () => {
    const newUser = await userService.createUser(mockUser);
    const updatedUser = await userService.updateUser(
      (newUser?.data as unknown as TUser).id,
      { login: 'test1' }
    );
    expect(updatedUser).toBeTruthy();
    expect((updatedUser?.data as unknown as TUser).login).toBe('test1');
    expect(updatedUser?.meta).toBeTruthy();
  });

  it('should not update non existing user', async () => {
    const updatedUser = await userService.updateUser(10, { login: 'test1' });
    expect(updatedUser).toBeFalsy();
  });

  it('should delete user', async () => {
    const newUser = await userService.createUser(mockUser);
    const deletedUser = await userService.softDeleteUser(
      (newUser?.data as unknown as TUser).id
    );
    expect(deletedUser).toBeTruthy();
  });

  it('should not delete non existing user', async () => {
    const deletedUser = await userService.softDeleteUser(10);
    expect(deletedUser).toBeFalsy();
  });

  it('should return user by id', async () => {
    const newUser = await userService.createUser(mockUser);
    const user = await userService.getUserById(
      (newUser?.data as unknown as TUser).id
    );
    expect(user).toBeTruthy();
  });

  it('should not return user by id', async () => {
    const user = await userService.getUserById(10);
    expect(user).toBeFalsy();
  });

  it('should return users', async () => {
    const users = await userService.getUsers('', 1, 1);
    expect(users).toBeTruthy();
    expect(users.data).toBeTruthy();
    expect(users.meta).toBeTruthy();
    expect(users.total).toBe(0);
  });
});
