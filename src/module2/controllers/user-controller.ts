import { Request, Response, NextFunction } from 'express';

import { IDataBase } from '../models/db-model';
import { TUser, TUserService } from '../models/user-model';

const UserService = require('../services/user-service');

class UserController {
  readonly service: TUserService;

  constructor(db: IDataBase<TUser>) {
    this.service = new UserService(db);

    this.getUsers = this.getUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.createUser = this.createUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.getAutoSuggestUsers = this.getAutoSuggestUsers.bind(this);
    this.softDeleteUser = this.softDeleteUser.bind(this);
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.findUser({ isDeleted: false });
      return res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await this.service.findUser({ id, isDeleted: false });
      // TODO add check of empty array
      return res.json(result[0] || {});
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
      const updatedUser = await this.service.updateUser(rest);
      return res.json(updatedUser);
    } catch (e) {
      next(e);
    }
  }

  async getAutoSuggestUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? +req.query.limit : 10;
      const login = (req.query.login as string)?.toLowerCase() || '';
      const users = await this.service.findUser({ isDeleted: false });
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
      const { id } = req.params;
      await this.service.softDeleteUser(id);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = UserController;
