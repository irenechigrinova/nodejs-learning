import { TUser } from './user.types';

export interface IUserService {
  findUsers: (
    substr: string,
    limit: number,
    offset: number
  ) => Promise<{ data: TUser[]; total: number }>;
  findUserById: (id: number) => Promise<TUser[]>;
  createUser: (user: Partial<TUser>) => Promise<TUser[]>;
  updateUser: (id: number, user: Partial<TUser>) => Promise<TUser[]>;
  softDeleteUser: (id: number) => Promise<boolean>;
  sortUsers: (
    users: TUser[],
    params: { login: string; limit: number; offset: number }
  ) => { result: TUser[]; total: number };
}
