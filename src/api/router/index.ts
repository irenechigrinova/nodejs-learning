import { Router } from 'express';

import AppDataSource from '../data-source';

import UserRepository from '../repository/user-repository';
import GroupRepository from '../repository/group-repository';
import PermissionRepository from '../repository/permission-repository';

import UserService from '../services/user-service';
import GroupService from '../services/group-service';

import userRouter from './user-router';
import permissionRouter from './permission-router';
import groupRouter from './group-router';

import User from '../entities/User';
import Group from '../entities/Group';
import Permission from '../entities/Permission';

import { TRepository } from '../types/common.types';

const userRepository = new UserRepository(AppDataSource.getRepository(User));
const groupRepository = new GroupRepository(AppDataSource.getRepository(Group));
const permissionRepository = new PermissionRepository(
  AppDataSource.getRepository(Permission)
);

const userService = new UserService(
  userRepository as unknown as TRepository,
  groupRepository as unknown as TRepository,
  AppDataSource
);
const groupService = new GroupService(
  groupRepository as unknown as TRepository,
  permissionRepository as unknown as TRepository
);

const appUserRouter = userRouter(userService);
const appGroupRouter = groupRouter(groupService);
const appPermissionRouter = permissionRouter(
  permissionRepository as unknown as TRepository
);

const rootRouter = Router();

rootRouter.use('/users', appUserRouter);
rootRouter.use('/permissions', appPermissionRouter);
rootRouter.use('/groups', appGroupRouter);

export default rootRouter;
