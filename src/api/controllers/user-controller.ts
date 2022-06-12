import { Request, Response } from 'express';

import UserRepository from '../repository/user-repository';

import { TUser } from '../types/user.types';

class UserController {
  readonly repository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.repository = userRepository;
  }

  async createUser(req: Request, res: Response) {
    const { login, password, age } = req.body;
    const newUser: TUser | undefined = await this.repository.create({
      login,
      password,
      age,
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
    const { ...rest } = req.body;
    const { userId } = req.params;
    const updatedUser = await this.repository.findByIdAndUpdate(+userId, rest);
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
  }

  async getUserById(req: Request, res: Response) {
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
  }

  async getUsers(req: Request, res: Response) {
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
  }
}

export default UserController;
