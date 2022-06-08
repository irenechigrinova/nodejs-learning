import { Request, Response, NextFunction } from 'express';

import UserRepository from '../repository/user-repository';

import { TUser } from '../types/user.types';

class UserController {
  readonly repository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.repository = userRepository;
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { login, password, age } = req.body;
      const newUser: TUser = await this.repository.create({
        login,
        password,
        age,
      });
      delete newUser.isDeleted;
      return res.json(newUser);
    } catch (e) {
      next(e);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { ...rest } = req.body;
      const { userId } = req.params;
      const updatedUser = await this.repository.findByIdAndUpdate(
        +userId,
        rest
      );
      if (updatedUser) {
        delete updatedUser.isDeleted;
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

  async softDeleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const result = await this.repository.findByIdAndDelete(+userId);
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
      const result = await this.repository.findById(+userId);
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

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? +req.query.limit : 10;
      const offset = req.query.offset ? +req.query.offset : 0;
      const login = (req.query.login as string)?.toLowerCase() || '';
      const { data, total } = await this.repository.findByParams(
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

export default UserController;
