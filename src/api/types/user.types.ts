export type TUser = {
  id: number;
  login: string;
  password: string;
  age: number;
  deletedAt?: Date | null;
};
