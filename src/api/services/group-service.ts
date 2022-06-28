import { TGroup } from '../types/group.types';
import { TPermission } from '../types/permission.types';
import { TRepository } from '../types/common.types';

class GroupService {
  readonly repository: TRepository;

  readonly permissionRepository: TRepository;

  constructor(groupRepository: TRepository, permissionRepository: TRepository) {
    this.repository = groupRepository;
    this.permissionRepository = permissionRepository;
  }

  private async toJson(group: TGroup | TGroup[]) {
    const permissions = await this.permissionRepository.findAll();
    let data;
    if (Array.isArray(group)) {
      data = group.map((item) => ({
        ...item,
        permissions: item.permissions.map(
          (permission) => (permission as unknown as TPermission).id
        ),
      }));
    } else {
      data = {
        ...group,
        permissions: group.permissions.map(
          (permission) => (permission as unknown as TPermission).id
        ),
      };
    }
    return { data, meta: { permissions } };
  }

  async createGroup(name: string, permissionsIds: number[]) {
    const permissions = await this.permissionRepository.findAllPermissionsById(
      permissionsIds
    );
    const newGroup: TGroup = await this.repository.create({
      name,
      permissions,
    });
    return this.toJson(newGroup);
  }

  async updateGroup(name: string, permissionsIds: number[], groupId: number) {
    const groupToUpdate: { name?: string; permissions?: TPermission[] } = {};
    if (permissionsIds) {
      groupToUpdate.permissions =
        await this.permissionRepository.findAllPermissionsById(permissionsIds);
    }
    if (name) {
      groupToUpdate.name = name;
    }

    const updatedGroup = await this.repository.findByIdAndUpdate(
      groupId,
      groupToUpdate
    );
    return updatedGroup ? this.toJson(updatedGroup) : undefined;
  }

  async deleteGroup(groupId: number) {
    return this.repository.findByIdAndDelete(groupId);
  }

  async getGroupById(groupId: number) {
    const result = await this.repository.findById(groupId);
    return result ? this.toJson(result) : undefined;
  }

  async getAllGroups() {
    const groups = await this.repository.findAll();
    return this.toJson(groups);
  }
}

export default GroupService;
