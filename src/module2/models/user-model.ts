export type TUser = {
  id: string;
  login: string;
  password: string;
  age: number;
  isDeleted: boolean;
};

export type TUserService = {
  findUsers: (params: Partial<TUser>) => Promise<TUser[]>;
  findUserById: (id: string) => Promise<TUser | undefined>;
  createUser: (user: Partial<TUser>) => Promise<TUser>;
  updateUser: (id: string, user: Partial<TUser>) => Promise<TUser | undefined>;
  softDeleteUser: (id: string) => Promise<boolean>;
};
