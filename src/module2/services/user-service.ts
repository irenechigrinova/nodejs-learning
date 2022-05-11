import { IDataBase } from '../models/db-model';
import { TUser } from '../models/user-model';

class UserService {
  private db: IDataBase<TUser>;

  constructor(db: IDataBase<TUser>) {
    this.db = db;

    this.findUser = this.findUser.bind(this);
    this.createUser = this.createUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.softDeleteUser = this.softDeleteUser.bind(this);
  }

  findUser(params: Record<keyof TUser, any>) {
    return this.db.find(params);
  }

  createUser(user: TUser) {
    return this.db.create(user);
  }

  updateUser(user: TUser) {
    return this.db.findByIdAndUpdate(user.id, user);
  }

  softDeleteUser(id: string) {
    return this.db.findByIdAndDelete(id);
  }
}

module.exports = UserService;
