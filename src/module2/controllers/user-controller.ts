import { Request, Response, NextFunction } from 'express';

import { IDataBase } from '../models/db-model';
import { TUser, TUserService } from '../models/user-model';

const UserService = require('../services/user-service');

class UserController {
  readonly service: TUserService;

  constructor(db: IDataBase<TUser>) {
    this.service = new UserService(db);

    this.getUsers = this.getUsers.bind(this);
    this.getDeletedUsers = this.getDeletedUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.createUser = this.createUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.getAutoSuggestUsers = this.getAutoSuggestUsers.bind(this);
    this.softDeleteUser = this.softDeleteUser.bind(this);
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findUsers({ isDeleted: false });
      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async getDeletedUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findUsers({ isDeleted: true });
      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const result = await this.service.findUserById(userId);
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
    } catch (e) {
      next(e);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { login, password, age } = req.body;
      const newUser = await this.service.createUser({
        id: '',
        login,
        password,
        age,
        isDeleted: false,
      });
      return res.json(newUser);
    } catch (e) {
      next(e);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { ...rest } = req.body;
      const { userId } = req.params;
      const updatedUser = await this.service.updateUser(userId, rest);
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
    } catch (e) {
      next(e);
    }
  }

  async getAutoSuggestUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? +req.query.limit : 10;
      const login = (req.query.login as string)?.toLowerCase() || '';
      const users = await this.service.findUsers({ isDeleted: false });
      const filtered = users
        .splice(0, +limit)
        .filter((user) => user.login.toLowerCase().indexOf(login) !== -1)
        .sort((a, b) => a.login.localeCompare(b.login));
      return res.json(filtered);
    } catch (e) {
      next(e);
    }
  }

  async softDeleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const result = await this.service.softDeleteUser(userId);
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
}

module.exports = UserController;
