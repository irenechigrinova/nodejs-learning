import { IDataBase } from '../types/db.types';
import { TUser } from '../types/user.types';

class UserRepository {
  private model: IDataBase<TUser>;

  constructor(model: IDataBase<TUser>) {
    this.model = model;
  }

  find(params: Record<keyof TUser, any>): Promise<TUser[]> {
    return this.model.find(params);
  }

  create(item: TUser): Promise<TUser> {
    return this.model.create(item);
  }

  async findByIdAndDelete(id: string, flag: keyof TUser): Promise<boolean> {
    return this.model.findByIdAndDelete(id, flag);
  }

  async findByIdAndUpdate(
    id: string,
    updatedItem: Partial<TUser>,
    flag: keyof TUser
  ): Promise<TUser | undefined> {
    return this.model.findByIdAndUpdate(id, updatedItem, flag);
  }

  truncate() {
    return this.model.truncate();
  }
}

module.exports = UserRepository;
