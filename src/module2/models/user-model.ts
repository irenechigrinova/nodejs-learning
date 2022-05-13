export type TUser = {
  id: string;
  login: string;
  password: string;
  age: number;
  isDeleted: boolean;
};

export type TUserService = {
  findUser: (params: Partial<TUser>) => Promise<TUser[]>;
  createUser: (user: TUser) => Promise<TUser>;
  updateUser: (user: TUser) => Promise<TUser>;
  softDeleteUser: (id: string) => Promise<string>;
};
