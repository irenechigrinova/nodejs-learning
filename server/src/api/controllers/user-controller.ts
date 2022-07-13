import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

import { IUserService, TTransactionError } from '../types/user.types';
import { ITokenService } from '../types/token.types';

class UserController {
  private service: IUserService;

  private tokenService: ITokenService;

  constructor(service: IUserService, tokenService: ITokenService) {
    this.service = service;
    this.tokenService = tokenService;
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

  async login(req: Request, res: Response) {
    const { login, password } = req.body;
    if (!login || !password) {
      res.status(400).json({
        error: 'Login and password fields are required',
        details: {},
      });
      return;
    }
    const user = await this.service.getUserByLogin(login);
    if (!user) {
      res.status(404).json({
        error: 'No user found',
        details: {
          userId: `No user with login ${login} found`,
        },
      });
    }
    const isPassEqual = await bcrypt.compare(password, user!.password);
    if (!isPassEqual) {
      res.status(400).json({
        error: 'Fields do not match',
        details: {
          userId: 'No match found for login and password',
        },
      });
    }

    const { accessToken, refreshToken } = this.tokenService.generateTokens({
      login: user!.login,
      id: user!.id.toString(),
    });
    await this.tokenService.saveToken(user!.id, refreshToken);
    res.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'none',
      secure: true,
      httpOnly: true,
    });
    return res.json({
      accessToken,
      refreshToken,
      user: {
        login: user!.login,
        id: user!.id,
      },
    });
  }

  async logout(req: Request, res: Response) {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      res.status(403).json({
        error: 'No refresh token provided',
        details: {},
      });
    }
    await this.tokenService.removeToken(refreshToken);
    res.clearCookie('refreshToken');
    return res.json({ success: true });
  }

  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.cookies;
    const { user } = req.body;
    if (!refreshToken) {
      res.status(403).json({
        error: 'No refresh token provided',
        details: {},
      });
      return;
    }
    const data = await this.tokenService.updateRefreshToken(refreshToken, user);
    if (!data) {
      res.status(403).json({
        error: 'Token is not valid',
        details: {},
      });
      return;
    }
    res.cookie('refreshToken', data!.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return res.json(data);
  }
}

export default UserController;
