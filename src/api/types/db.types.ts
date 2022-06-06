export interface IDataBase<T> {
  findByParams: (
    substr: string,
    limit: number,
    offset: number
  ) => Promise<{ data: T[]; total: number }>;
  findById: (id: number) => Promise<T[]>;
  create: (entity: Partial<T>) => Promise<T>;
  findByIdAndDelete: (id: number) => Promise<boolean>;
  findByIdAndUpdate: (id: string, entity: Partial<T>) => Promise<T | undefined>;
}
