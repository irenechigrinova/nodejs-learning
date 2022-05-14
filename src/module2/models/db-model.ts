export interface IDataBase<T> {
  find: (params: Partial<T>) => Promise<T>;
  create: (entity: T) => Promise<T>;
  findByIdAndDelete: (id: string) => Promise<null>;
  findByIdAndUpdate: (id: string, entity: T) => Promise<T>;
  truncate: () => void;
}
