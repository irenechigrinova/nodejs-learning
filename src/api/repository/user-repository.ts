import { Like, Repository } from 'typeorm';

import User from '../entities/User';

import { TUser } from '../types/user.types';

class UserRepository {
  private repository: Repository<User>;

  constructor(repository: Repository<User>) {
    this.repository = repository;
  }

  async create(item: Partial<TUser>): Promise<TUser> {
    const { login, password, age } = item;
    const user = new User();
    user.login = login as string;
    user.password = password as string;
    user.age = age as number;
    user.isDeleted = false;
    await this.repository.save(user);
    return user;
  }

  async findByIdAndUpdate(
    id: number,
    updatedItem: Partial<TUser>
  ): Promise<TUser | undefined> {
    const userToUpdate: TUser | null = await this.repository.findOneBy({
      id,
      isDeleted: false,
    });
    if (userToUpdate) {
      (Object.keys(updatedItem) as Array<keyof typeof updatedItem>).forEach(
        (key) => {
          // @ts-ignore
          userToUpdate[key] = updatedItem[key];
        }
      );
      await this.repository.save(userToUpdate);
      return userToUpdate;
    }
    return undefined;
  }

  async findByIdAndDelete(id: number): Promise<boolean> {
    const updatedUser = await this.findByIdAndUpdate(id, { isDeleted: true });
    return !!updatedUser;
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
        login: Like(`%${loginSubstr}%`),
      },
    });
    return {
      data: users.map(({ isDeleted, ...rest }) => rest),
      total,
    };
  }

  async findById(id: number): Promise<TUser | null> {
    return this.repository.findOneBy({
      id,
      isDeleted: false,
    });
  }
}

export default UserRepository;
