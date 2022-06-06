import { IDataBase } from '../types/db.types';
import { TUser } from '../types/user.types';

class UserService {
  private db: IDataBase<TUser>;

  constructor(db: IDataBase<TUser>) {
    this.db = db;

    this.findUserById = this.findUserById.bind(this);
    this.findUsers = this.findUsers.bind(this);
    this.createUser = this.createUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.softDeleteUser = this.softDeleteUser.bind(this);
  }

  async findUserById(id: number): Promise<TUser[]> {
    return this.db.findById(id);
  }

  async findUsers(
    substr: string,
    limit: number,
    offset: number
  ): Promise<{ data: TUser[]; total: number }> {
    return this.db.findByParams(substr, limit, offset);
  }

  createUser(user: Partial<TUser>): Promise<TUser> {
    return this.db.create(user);
  }

  updateUser(id: string, fields: Partial<TUser>): Promise<TUser | undefined> {
    return this.db.findByIdAndUpdate(id, fields);
  }

  softDeleteUser(id: number): Promise<boolean> {
    return this.db.findByIdAndDelete(id);
  }
}

module.exports = UserService;
