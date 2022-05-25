export interface IDataBase<T> {
  find: (params: Partial<T>) => Promise<T[]>;
  create: (entity: Partial<T>) => Promise<T>;
  findByIdAndDelete: (id: string, flag: keyof T) => Promise<boolean>;
  findByIdAndUpdate: (
    id: string,
    entity: Partial<T>,
    flag: keyof T
  ) => Promise<T | undefined>;
  truncate: () => void;
}
