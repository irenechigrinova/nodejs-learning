import { In, Repository } from 'typeorm';

import Group from '../entities/Group';

import { TGroup } from '../types/group.types';

class GroupRepository {
  private repository: Repository<TGroup>;

  constructor(repository: Repository<TGroup>) {
    this.repository = repository;
  }

  async create(group: Partial<TGroup>): Promise<TGroup> {
    const newGroup = new Group();
    const groupToSave: TGroup = {
      ...newGroup,
      ...group,
    };

    await this.repository.save(groupToSave);
    return groupToSave;
  }

  async findByIdAndUpdate(
    id: number,
    group: Partial<TGroup>
  ): Promise<TGroup | undefined> {
    const groupToUpdate: TGroup | null = await this.repository.findOne({
      where: {
        id,
      },
      relations: ['permissions', 'users'],
    });
    if (groupToUpdate) {
      const newGroup = {
        ...groupToUpdate,
        ...group,
      };
      await this.repository.save(newGroup);
      return newGroup;
    }
    return undefined;
  }

  async findByIdAndDelete(id: number): Promise<boolean> {
    const groupToDelete: TGroup | null = await this.repository.findOneBy({
      id,
    });
    if (groupToDelete) {
      await this.repository.delete(id);
      return true;
    }
    return false;
  }

  async findAll(): Promise<TGroup[]> {
    return this.repository.find({ relations: ['permissions', 'users'] });
  }

  async findById(id: number): Promise<TGroup | null> {
    return this.repository.findOne({
      where: {
        id,
      },
      relations: ['permissions', 'users'],
    });
  }

  async findAllGroupsById(ids: number[]): Promise<TGroup[]> {
    return this.repository.find({
      where: {
        id: In(ids),
      },
    });
  }
}

export default GroupRepository;
