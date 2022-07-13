import { ILike, In, Repository } from 'typeorm';

import User from '../entities/User';

import { TUser } from '../types/user.types';
import { TGroup } from '../types/group.types';

class UserRepository {
  private repository: Repository<User>;

  constructor(repository: Repository<User>) {
    this.repository = repository;
  }

  async create(item: Partial<TUser>): Promise<TUser | undefined> {
    const user = new User();
    const newUser: TUser = {
      ...user,
      ...item,
    };
    const userExists = await this.repository.findOneBy({ login: item.login });
    if (userExists) {
      return undefined;
    }

    await this.repository.save(newUser as User);
    delete newUser.deletedAt;
    return newUser;
  }

  async findByIdAndUpdate(
    id: number,
    updatedItem: Partial<TUser>
  ): Promise<TUser | undefined> {
    const userToUpdate: TUser | null = await this.repository.findOne({
      where: {
        id,
      },
      relations: ['groups'],
    });
    if (userToUpdate) {
      const newUser = {
        ...userToUpdate,
        ...updatedItem,
      };
      await this.repository.save(newUser as User);
      delete newUser.deletedAt;
      return newUser;
    }
    return undefined;
  }

  async findByIdAndDelete(id: number): Promise<boolean> {
    const userToDelete: TUser | null = await this.repository.findOneBy({
      id,
    });
    if (userToDelete) {
      await this.repository.softDelete(id);
      return true;
    }
    return false;
  }

  async findByParams(
    loginSubstr: string,
    limit: number,
    offset: number
  ): Promise<{ data: TUser[]; total: number }> {
    const [users, total] = await this.repository.findAndCount({
      order: {
        login: 'ASC',
      },
      skip: offset,
      take: limit,
      where: {
        login: ILike(`${loginSubstr}%`),
      },
      relations: ['groups'],
    });
    return {
      data: users,
      total,
    };
  }

  async findById(id: number): Promise<TUser | null> {
    return this.repository.findOne({
      where: {
        id,
      },
      relations: ['groups'],
    });
  }

  async findAllUsersById(ids: number[]): Promise<TUser[]> {
    return this.repository.find({
      where: {
        id: In(ids),
      },
      relations: ['groups'],
    });
  }

  async findByLogin(login: string): Promise<TUser | null> {
    return this.repository.findOne({
      where: {
        login,
      },
      select: ['id', 'login', 'password'],
    });
  }
}

export default UserRepository;
