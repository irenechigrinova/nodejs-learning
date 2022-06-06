import { Request, Response, NextFunction } from 'express';

import { IDataBase } from '../types/db.types';
import { TUser } from '../types/user.types';
import { IUserService } from '../types/user-service.types';

const UserService = require('../services/user-service');

class UserController {
  readonly service: IUserService;

  constructor(db: IDataBase<TUser>) {
    this.service = new UserService(db);
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { login, password, age } = req.body;
      const newUser: TUser[] = await this.service.createUser({
        login,
        password,
        age,
      });
      return res.json(newUser[0]);
    } catch (e) {
      next(e);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { ...rest } = req.body;
      const { userId } = req.params;
      const updatedUser = await this.service.updateUser(+userId, rest);
      if (updatedUser.length) {
        res.json(updatedUser[0]);
      } else {
        res.status(404).json({
          error: 'No entity found',
          details: {
            userId: `Cannot update user. No user with id ${userId} found`,
          },
        });
      }
    } catch (e) {
      next(e);
    }
  }

  async softDeleteUser(req: Request, res: Response, next: NextFunction) {
    try {
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
    } catch (e) {
      next(e);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const result = await this.service.findUserById(+userId);
      if (result.length) {
        res.json(result[0]);
      } else {
        res.status(404).json({
          error: 'No entity found',
          details: {
            userId: `No user with id ${userId} found`,
          },
        });
      }
    } catch (e) {
      next(e);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? +req.query.limit : 10;
      const offset = req.query.offset ? +req.query.offset : 0;
      const login = (req.query.login as string)?.toLowerCase() || '';
      const { data, total } = await this.service.findUsers(
        login,
        limit,
        offset
      );
      return res.json({
        users: data,
        pagination: {
          limit,
          offset,
          total,
        },
      });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = UserController;
