import { TGroup } from './group.types';

export type TUser = {
  id: number;
  login: string;
  password: string;
  age: number;
  deletedAt?: Date | null;
  groups: TGroup[];
};

export type TUserReturnType = {
  id: number;
  login: string;
  password: string;
  age: number;
  groups: number[];
};

export type TReturnData = {
  data: TUserReturnType | TUserReturnType[];
  meta: {
    groups: {
      name: string;
      id: number;
    }[];
  };
};

export type TTransactionError = {
  error: string;
  details: unknown;
};

export interface IUserService {
  createUser: (
    user: Partial<TUser> & { groupsIds: number[] }
  ) => Promise<TReturnData | undefined>;
  updateUser: (
    userId: number,
    params: Partial<TUser> & { groupsIds?: number[] }
  ) => Promise<TReturnData | undefined>;
  softDeleteUser: (userId: number) => Promise<boolean>;
  getUserById: (userId: number) => Promise<TReturnData | undefined>;
  getUserByLogin: (
    login: string
  ) => Promise<{ login: string; password: string; id: number } | null>;
  getUsers: (
    login: string,
    limit: number,
    offset: number
  ) => Promise<TReturnData & { total: number }>;
  addUsersToGroup: (
    usersIds: number[],
    groupId: number
  ) => Promise<TReturnData | TTransactionError>;
  removeUsersFromGroup: (
    usersIds: number[],
    groupId: number
  ) => Promise<TReturnData | TTransactionError>;
}
