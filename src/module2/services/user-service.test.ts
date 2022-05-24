const UserService = require('./user-service');

describe('User Service test', () => {
  const db = {
    list: [
      { id: '2', name: '2' },
      { id: '3', name: '3' },
    ],
    find(params: { id?: string }) {
      return params.id
        ? this.list.filter((item) => item.id === params.id)
        : this.list;
    },
    create(entity: any) {
      return { ...entity, id: '1' };
    },
    findByIdAndDelete(id: any) {
      return this.list.some((item) => item.id === id);
    },
    findByIdAndUpdate(id: any, entity: any) {
      return this.list.some((item) => item.id === id) ? entity : undefined;
    },
  };

  const service = new UserService(db);

  it('should find user', async () => {
    const found = await service.findUserById('2');
    expect(found).toBeTruthy();
  });

  it('should not find user', async () => {
    const found = await service.findUserById('4');
    expect(found).not.toBeTruthy();
  });

  it('should find users', async () => {
    const found = await service.findUsers({});
    expect(found.length).toBe(2);
  });

  it('should create user', async () => {
    const created = await service.createUser({});

    expect(created).toBeTruthy();
    expect(created.id).toBeTruthy();
  });

  it('should update user', async () => {
    const updated = await service.updateUser('2', {});

    expect(updated).toBeTruthy();
  });

  it('should not update user', async () => {
    const updated = await service.updateUser('4', {});

    expect(updated).not.toBeTruthy();
  });

  it('should delete user', async () => {
    const deleted = await service.softDeleteUser('2');

    expect(deleted).toBe(true);
  });

  it('should not delete user', async () => {
    const deleted = await service.softDeleteUser('1');

    expect(deleted).toBe(false);
  });

  it('should sort users', async () => {
    const users = [
      { login: 'def', id: '1' },
      { login: 'abc', id: '2' },
      { login: 'ghi', id: '3' },
    ];
    const { result, total } = service.sortUsers(users, {
      limit: 10,
      offset: 0,
      login: '',
    });

    expect(result.length).toBe(3);
    expect(result[0].login).toBe('abc');
    expect(total).toBe(3);
  });
});
