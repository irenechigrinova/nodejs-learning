import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

import { IUserService, TTransactionError } from '../types/user.types';

class UserController {
  private service: IUserService;

  constructor(service: IUserService) {
    this.service = service;
  }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 5);
  }

  async createUser(req: Request, res: Response) {
    const { login, password, age, groupsIds } = req.body;
    const hashedPassword = await this.hashPassword(password);

    const newUser = await this.service.createUser({
      login,
      password: hashedPassword,
      age,
      groupsIds,
    });
    if (newUser) {
      res.json(newUser);
    } else {
      res.status(400).json({
        error: 'Login is not unique',
        details: {
          login: `Cannot create user. User with login ${login} already exists`,
        },
      });
    }
  }

  async updateUser(req: Request, res: Response) {
    const { ...params } = req.body;
    const { userId } = req.params;
    const updatedUser = await this.service.updateUser(+userId, params);
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({
        error: 'No entity found',
        details: {
          userId: `Cannot update user. No user with id ${userId} found`,
        },
      });
    }
  }

  async softDeleteUser(req: Request, res: Response) {
    const { userId } = req.params;
    const result = await this.service.softDeleteUser(+userId);
    if (result) {
      res.json({ success: true });
    } else {
      res.status(404).json({
        error: 'No entity found',
        details: {
          userId: `Cannot delete user. No user with id ${userId} found`,
        },
      });
    }
  }

  async getUserById(req: Request, res: Response) {
    const { userId } = req.params;
    const result = await this.service.getUserById(+userId);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({
        error: 'No entity found',
        details: {
          userId: `No user with id ${userId} found`,
        },
      });
    }
  }

  async getUsers(req: Request, res: Response) {
    const limit = req.query.limit ? +req.query.limit : 10;
    const offset = req.query.offset ? +req.query.offset : 0;
    const login = (req.query.login as string)?.toLowerCase() || '';
    const { data, meta, total } = await this.service.getUsers(
      login,
      limit,
      offset
    );
    return res.json({
      users: data,
      meta,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  }

  async addUsersToGroup(req: Request, res: Response) {
    const { usersIds, groupId } = req.body;

    const result = await this.service.addUsersToGroup(usersIds, +groupId);
    res.status((result as TTransactionError).error ? 400 : 200).json(result);
  }

  async removeUsersFromGroup(req: Request, res: Response) {
    const { usersIds, groupId } = req.body;

    const result = await this.service.removeUsersFromGroup(usersIds, +groupId);
    res.status((result as TTransactionError).error ? 400 : 200).json(result);
  }
}

export default UserController;
