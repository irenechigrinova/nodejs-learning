export interface IDataBase<T> {
  find: (params: { [field: string]: string | number }) => T;
  create: (entity: T) => T;
  findByIdAndDelete: (id: string) => null;
  findByIdAndUpdate: (id: string, entity: T) => T;
}
