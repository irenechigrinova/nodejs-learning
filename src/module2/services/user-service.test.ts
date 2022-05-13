const UserService = require('./user-service');

describe('User Service test', () => {
  const db = {
    list: [
      { id: '2', name: '2' },
      { id: '3', name: '3' },
    ],
    find() {
      return this.list;
    },
    create(entity: any) {
      return [...this.list, { ...entity, id: '1' }];
    },
    findByIdAndDelete(id: any) {
      return this.list;
    },
    findByIdAndUpdate(id: any, entity: any) {
      return this.list;
    },
  };

  const service = new UserService(db);

  it('should find users', async () => {
    const found = await service.findUser({ id: '1' });
    expect(found.length).toBe(2);
    expect(found[0].id).toBe('2');
  });

  it('should create user', async () => {
    const created = await service.createUser({});

    expect(created.length).toBe(3);
    expect(created[2].id).toBe('1');
  });

  it('should update user', async () => {
    const updated = await service.updateUser({});

    expect(updated.length).toBe(2);
  });

  it('should delete user', async () => {
    const deleted = await service.softDeleteUser('1');

    expect(deleted.length).toBe(2);
  });
});
