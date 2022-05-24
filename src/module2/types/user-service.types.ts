import { TUser } from './user.types';

export interface TUserService {
  findUsers: (params: Partial<TUser>) => Promise<TUser[]>;
  findUserById: (id: string) => Promise<TUser | undefined>;
  createUser: (user: Partial<TUser>) => Promise<TUser>;
  updateUser: (id: string, user: Partial<TUser>) => Promise<TUser | undefined>;
  softDeleteUser: (id: string) => Promise<boolean>;
  sortUsers: (
    users: TUser[],
    params: { login: string; limit: number; offset: number }
  ) => { result: TUser[]; total: number };
}
