export type TUser = {
  id: number;
  login: string;
  password: string;
  age: number;
  groups: number[];
};

export type TReturnData = {
  data: TUser | TUser[];
  meta: {
    groups: {
      name: string;
      id: number;
    }[];
  };
};
