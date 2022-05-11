export type TUser = {
  id: string;
  login: string;
  password: string;
  age: number;
  isDeleted: boolean;
};

export type TUserService = {
  findUser: (params: Partial<TUser>) => TUser[];
  createUser: (user: TUser) => TUser;
  updateUser: (user: TUser) => TUser;
  softDeleteUser: (id: string) => string;
};
