import { IDataBase } from '../models/db-model';
import { TUser } from '../models/user-model';

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

  async findUserById(id: string): Promise<TUser | undefined> {
    const list: TUser[] = await this.db.find({ id, isDeleted: false });
    return list[0];
  }

  async findUsers(params: Partial<TUser>): Promise<TUser[]> {
    return this.db.find(params);
  }

  createUser(user: Partial<TUser>): Promise<TUser> {
    return this.db.create(user);
  }

  updateUser(id: string, fields: Partial<TUser>): Promise<TUser | undefined> {
    return this.db.findByIdAndUpdate(id, fields, 'isDeleted');
  }

  softDeleteUser(id: string): Promise<boolean> {
    return this.db.findByIdAndDelete(id, 'isDeleted');
  }
}

module.exports = UserService;
