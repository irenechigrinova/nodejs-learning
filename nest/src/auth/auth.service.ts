import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import UserEntity from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getUserByLogin(login: string) {
    return this.userRepository.findOne({
      where: {
        login,
      },
      select: ['id', 'login', 'password'],
    });
  }

  async getUserById(id: number) {
    return this.userRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'login', 'password', 'refreshToken'],
    });
  }

  async updateRefreshToken(id: number, refreshToken: string) {
    const userToUpdate = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (userToUpdate) {
      const newUser = {
        ...userToUpdate,
        refreshToken,
      };
      return this.userRepository.save(newUser);
    }
    return undefined;
  }

  async destroyToken(id: number) {
    const userToUpdate = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (userToUpdate) {
      const newUser = {
        ...userToUpdate,
        refreshToken: null,
      };
      return this.userRepository.save(newUser);
    }
    return undefined;
  }
}
