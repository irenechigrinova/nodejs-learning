import { Router } from 'express';

import AppDataSource from '../data-source';

import UserRepository from '../repository/user-repository';
import GroupRepository from '../repository/group-repository';
import PermissionRepository from '../repository/permission-repository';
import TokenRepository from '../repository/token-repository';

import UserService from '../services/user-service';
import GroupService from '../services/group-service';
import TokenService from '../services/token-service';

import userRouter from './user-router';
import permissionRouter from './permission-router';
import groupRouter from './group-router';

import User from '../entities/User';
import Group from '../entities/Group';
import Permission from '../entities/Permission';
import Token from '../entities/Token';

import auth from '../middleware/auth';

import { TRepository } from '../types/common.types';

const userRepository = new UserRepository(AppDataSource.getRepository(User));
const groupRepository = new GroupRepository(AppDataSource.getRepository(Group));
const permissionRepository = new PermissionRepository(
  AppDataSource.getRepository(Permission)
);
const tokenRepository = new TokenRepository(AppDataSource.getRepository(Token));

const userService = new UserService(
  userRepository as unknown as TRepository,
  groupRepository as unknown as TRepository,
  AppDataSource
);
const groupService = new GroupService(
  groupRepository as unknown as TRepository,
  permissionRepository as unknown as TRepository
);
const tokenService = new TokenService(
  tokenRepository as unknown as TRepository
);

const appUserRouter = userRouter(userService, tokenService);
const appGroupRouter = groupRouter(groupService);
const appPermissionRouter = permissionRouter(
  permissionRepository as unknown as TRepository
);

const authMiddleware = auth(tokenService);

const rootRouter = Router();

rootRouter.use('/users', authMiddleware, appUserRouter);
rootRouter.use('/permissions', authMiddleware, appPermissionRouter);
rootRouter.use('/groups', authMiddleware, appGroupRouter);

export default rootRouter;
