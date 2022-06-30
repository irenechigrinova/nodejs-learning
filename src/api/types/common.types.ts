export type TPagination = {
  offset: number;
  limit: number;
  total: number;
};

export type TRepository = Record<string, Function>;
