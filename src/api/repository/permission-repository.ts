import { Repository, In } from 'typeorm';

import Permission from '../entities/Permission';

import { EPermission, TPermission } from '../types/permission.types';

class PermissionRepository {
  private repository: Repository<TPermission>;

  constructor(repository: Repository<TPermission>) {
    this.repository = repository;
  }

  async create(value: EPermission): Promise<TPermission> {
    const permission = new Permission();
    const newPermission: TPermission = {
      ...permission,
      value,
    };

    await this.repository.save(newPermission);
    return newPermission;
  }

  async findByIdAndUpdate(
    id: number,
    value: EPermission
  ): Promise<TPermission | undefined> {
    const permissionToUpdate: TPermission | null =
      await this.repository.findOneBy({
        id,
      });
    if (permissionToUpdate) {
      permissionToUpdate.value = value;
      await this.repository.save(permissionToUpdate);
      return permissionToUpdate;
    }
    return undefined;
  }

  async findByIdAndDelete(id: number): Promise<boolean> {
    const permissionToDelete: TPermission | null =
      await this.repository.findOneBy({
        id,
      });
    if (permissionToDelete) {
      await this.repository.delete(id);
      return true;
    }
    return false;
  }

  async findAll(): Promise<TPermission[]> {
    return this.repository.find();
  }

  async findById(id: number): Promise<TPermission | null> {
    return this.repository.findOneBy({
      id,
    });
  }

  async findAllPermissionsById(ids: number[]): Promise<TPermission[]> {
    return this.repository.find({
      where: {
        id: In(ids),
      },
    });
  }
}

export default PermissionRepository;
