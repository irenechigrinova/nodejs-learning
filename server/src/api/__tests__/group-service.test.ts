import { GroupRepositoryStub, PermissionRepositoryStub } from '../stubs/stubs';

import GroupService from '../services/group-service';

import { TGroup } from '../types/group.types';
import { TRepository } from '../types/common.types';

describe('Group Service', () => {
  const groupService = new GroupService(
    GroupRepositoryStub as unknown as TRepository,
    PermissionRepositoryStub as unknown as TRepository
  );

  afterEach(() => {
    GroupRepositoryStub.reset();
  });

  it('should create group', async () => {
    const newGroup = await groupService.createGroup('test', [1]);
    expect(newGroup).toBeTruthy();
    expect((newGroup?.data as unknown as TGroup).id).toBeTruthy();
    expect(newGroup?.meta).toBeTruthy();
  });

  it('should update group', async () => {
    const newGroup = await groupService.createGroup('test', [1]);
    const updatedGroup = await groupService.updateGroup(
      'test1',
      [1],
      (newGroup?.data as unknown as TGroup).id
    );
    expect(updatedGroup).toBeTruthy();
    expect((updatedGroup?.data as unknown as TGroup).name).toBe('test1');
  });

  it('should not update group', async () => {
    const updatedGroup = await groupService.updateGroup('test1', [1], 10);
    expect(updatedGroup).toBeFalsy();
  });

  it('should delete group', async () => {
    const newGroup = await groupService.createGroup('test', [1]);
    const deletedGroup = await groupService.deleteGroup(
      (newGroup?.data as unknown as TGroup).id
    );
    expect(deletedGroup).toBeTruthy();
  });

  it('should not delete group', async () => {
    const deletedGroup = await groupService.deleteGroup(10);
    expect(deletedGroup).toBeFalsy();
  });

  it('should get group by id', async () => {
    const newGroup = await groupService.createGroup('test', [1]);
    const group = await groupService.getGroupById(
      (newGroup?.data as unknown as TGroup).id
    );
    expect(group).toBeTruthy();
    expect(group?.data).toBeTruthy();
    expect((newGroup?.data as unknown as TGroup).id).toBe(
      (newGroup?.data as unknown as TGroup).id
    );
    expect(group?.meta).toBeTruthy();
  });

  it('should not get group by id', async () => {
    const group = await groupService.getGroupById(10);
    expect(group).toBeFalsy();
  });

  it('should return all groups', async () => {
    const groups = await groupService.getAllGroups();
    expect(groups).toBeTruthy();
    expect(groups?.data).toBeTruthy();
    expect(groups?.meta).toBeTruthy();
  });
});
