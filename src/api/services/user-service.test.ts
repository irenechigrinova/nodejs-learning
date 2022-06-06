const UserService = require('./user-service');

describe('User Service test', () => {
  const db = {
    list: [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ],
    findById(id: number) {
      return id ? this.list.filter((item) => item.id === id) : this.list;
    },
    findByParams() {
      return { data: this.list, total: 2 };
    },
    create(entity: any) {
      return { ...entity, id: 1 };
    },
    findByIdAndDelete(id: number) {
      return this.list.some((item) => item.id === id);
    },
    findByIdAndUpdate(id: number, entity: Record<string, unknown>) {
      return this.list.find((item) => item.id === id);
    },
  };

  const service = new UserService(db);

  it('should find user', async () => {
    const found = await service.findUserById(2);
    expect(found.length).toBe(1);
  });

  it('should not find user', async () => {
    const found = await service.findUserById(4);
    expect(found.length).toBe(0);
  });

  it('should find users', async () => {
    const found = await service.findUsers('', 10, 0);
    expect(found.data.length).toBe(2);
    expect(found.total).toBe(2);
  });

  it('should create user', async () => {
    const created = await service.createUser({ id: 10 });

    expect(created).toBeTruthy();
    expect(created.id).toBeTruthy();
  });

  it('should update user', async () => {
    const updated = await service.updateUser(2, {});

    expect(updated).toBeTruthy();
  });

  it('should not update user', async () => {
    const updated = await service.updateUser(4, {});

    expect(updated).not.toBeTruthy();
  });

  it('should delete user', async () => {
    const deleted = await service.softDeleteUser(2);

    expect(deleted).toBe(true);
  });

  it('should not delete user', async () => {
    const deleted = await service.softDeleteUser(1);

    expect(deleted).toBe(false);
  });
});
