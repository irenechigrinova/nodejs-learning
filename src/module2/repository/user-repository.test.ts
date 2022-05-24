const Repo = require('./user-repository');
const Model = require('../models/user-model');

const repoInstance = new Repo(new Model());

describe('Repository test', () => {
  beforeEach(async () => {
    await repoInstance.truncate();
  });

  it('should create item', async () => {
    const item = await repoInstance.create({ login: 'test', age: 10 });
    expect(item).toBeTruthy();
    expect(item.id).toBeTruthy();
  });

  it('should find item by params', async () => {
    await repoInstance.create({ login: 'test', age: 10 });
    await repoInstance.create({ login: 'smth', age: 10 });
    const found = await repoInstance.find({ login: 'test' });
    const found2 = await repoInstance.find({ age: 10 });

    expect(found.length).toBe(1);
    expect(found2.length).toBe(2);
  });

  it('should return true when item is deleted', async () => {
    const item = await repoInstance.create({
      login: 'smth',
      age: 10,
      isDeleted: false,
    });
    const deleted = await repoInstance.findByIdAndDelete(item.id, 'isDeleted');
    expect(deleted).toBe(true);

    const found = await repoInstance.find({ isDeleted: false });
    expect(found.length).toBe(0);
  });

  it('should return false when item to delete is not in array', async () => {
    await repoInstance.create({
      login: 'smth',
      age: 10,
      isDeleted: false,
    });
    const deleted = await repoInstance.findByIdAndDelete('1', 'isDeleted');
    expect(deleted).toBe(false);

    const found = await repoInstance.find({});
    expect(found.length).toBe(1);
  });

  it('should return updatedItem', async () => {
    const item = await repoInstance.create({
      login: 'smth',
      age: 10,
      isDeleted: false,
    });
    const updated = await repoInstance.findByIdAndUpdate(
      item.id,
      {
        login: 'test',
      },
      'isDeleted'
    );
    expect(updated).toBeTruthy();
    expect(updated.login).toBe('test');
  });

  it('should return undefined when item to update not in array', async () => {
    await repoInstance.create({
      login: 'smth',
      age: 10,
      isDeleted: false,
    });
    const updated = await repoInstance.findByIdAndUpdate(
      '1',
      {
        login: 'test',
      },
      'isDeleted'
    );
    expect(updated).not.toBeTruthy();
  });
});
