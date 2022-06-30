import { TGroup } from '../types/group.types';
import { EPermission, TPermission } from '../types/permission.types';
import { TUser } from '../types/user.types';

export const GroupRepositoryStub = {
  list: [] as TGroup[],
  reset() {
    this.list = [];
  },

  async create(name: string, permissionsIds: number[]): Promise<TGroup> {
    const groupToSave = {
      name,
      permissions: [],
      id: (this.list[this.list.length - 1]?.id || 0) + 1,
    };
    this.list.push(groupToSave as TGroup);
    return groupToSave as TGroup;
  },

  async findByIdAndUpdate(
    id: number,
    group: Partial<TGroup>
  ): Promise<TGroup | undefined> {
    const groupToUpdate: TGroup | null =
      this.list.find((group) => group.id === id) || null;
    if (groupToUpdate) {
      const newGroup = {
        ...groupToUpdate,
        ...group,
      };
      this.list = this.list.map((item) => (item.id === id ? newGroup : item));
      return newGroup;
    }
    return undefined;
  },

  async findByIdAndDelete(id: number): Promise<boolean> {
    const groupToDelete: TGroup | null =
      this.list.find((item) => item.id === id) || null;
    if (groupToDelete) {
      this.list = this.list.filter((item) => item.id !== id);
      return true;
    }
    return false;
  },

  async findAll(): Promise<TGroup[]> {
    return this.list;
  },

  async findById(id: number): Promise<TGroup | null> {
    return this.list.find((item) => item.id === id) || null;
  },

  async findAllGroupsById(ids: number[]): Promise<TGroup[]> {
    return this.list.filter((item) => ids.includes(item.id));
  },
};

export const PermissionRepositoryStub = {
  list: [] as TPermission[],
  reset() {
    this.list = [];
  },

  async create(value: EPermission): Promise<TPermission> {
    const newPermission = {
      value,
      id: (this.list[this.list.length - 1]?.id || 0) + 1,
    };

    this.list.push(newPermission as TPermission);
    return newPermission;
  },

  async findByIdAndUpdate(
    id: number,
    value: EPermission
  ): Promise<TPermission | undefined> {
    const permissionToUpdate: TPermission | null =
      this.list.find((item) => item.id === id) || null;
    if (permissionToUpdate) {
      permissionToUpdate.value = value;
      this.list = this.list.map((item) =>
        item.id === id ? permissionToUpdate : item
      );
      return permissionToUpdate;
    }
    return undefined;
  },

  async findByIdAndDelete(id: number): Promise<boolean> {
    const permissionToDelete: TPermission | null =
      this.list.find((item) => item.id === id) || null;
    if (permissionToDelete) {
      this.list = this.list.filter((item) => item.id !== id);
      return true;
    }
    return false;
  },

  async findAll(): Promise<TPermission[]> {
    return this.list;
  },

  async findById(id: number): Promise<TPermission | null> {
    return this.list.find((item) => item.id === id) || null;
  },

  async findAllPermissionsById(ids: number[]): Promise<TPermission[]> {
    return this.list.filter((item) => ids.includes(item.id));
  },
};

export const UserRepositoryStub = {
  list: [] as TUser[],
  reset() {
    this.list = [];
  },

  async create(item: Partial<TUser>): Promise<TUser | undefined> {
    const newUser = {
      ...item,
      id: (this.list[this.list.length - 1]?.id || 0) + 1,
      groups: [],
    };
    const userExists = this.list.find((item) => item.login === newUser.login);
    if (userExists) {
      return undefined;
    }

    this.list.push(newUser as TUser);
    return newUser as TUser;
  },

  async findByIdAndUpdate(
    id: number,
    updatedItem: Partial<TUser>
  ): Promise<TUser | undefined> {
    const userToUpdate: TUser | null =
      this.list.find((item) => item.id === id) || null;
    if (userToUpdate) {
      const newUser = {
        ...userToUpdate,
        ...updatedItem,
      };
      this.list = this.list.map((item) => (item.id === id ? newUser : item));
      return newUser;
    }
    return undefined;
  },

  async findByIdAndDelete(id: number): Promise<boolean> {
    const userToDelete: TUser | null =
      this.list.find((item) => item.id === id) || null;
    if (userToDelete) {
      this.list = this.list.filter((item) => item.id !== id);
      return true;
    }
    return false;
  },

  async findByParams(
    loginSubstr: string,
    limit: number,
    offset: number
  ): Promise<{ data: TUser[]; total: number }> {
    const [users, total] = [this.list, this.list.length];
    return {
      data: users,
      total,
    };
  },

  async findById(id: number): Promise<TUser | null> {
    return this.list.find((item) => item.id === id) || null;
  },

  async findAllUsersById(ids: number[]): Promise<TUser[]> {
    return this.list.filter((item) => ids.includes(item.id));
  },
};

const queryRunner = {
  manager: {
    async save() {
      // eslint-disable-next-line no-promise-executor-return
      return new Promise((resolve) => resolve(true));
    },
  },
  async startTransaction() {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise((resolve) => resolve(true));
  },
  async commitTransaction() {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise((resolve) => resolve(true));
  },
  async rollbackTransaction() {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise((resolve) => resolve(true));
  },
  async release() {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise((resolve) => resolve(true));
  },
};

export const AppDataSourceStub = {
  createQueryRunner: () => queryRunner,
};
