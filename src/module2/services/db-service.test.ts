const dbService = require('./db-service');

describe('DB Service test', () => {
  const list = [
    {
      id: '1',
      name: 'test',
      age: 10,
      isDeleted: false,
    },
    {
      id: '2',
      name: 'otherTest',
      age: 22,
      isDeleted: false,
    },
  ];

  it('should find items by params', async () => {
    const foundName = await dbService.find({ name: 'test' }, list);
    const foundAge = await dbService.find({ age: 10 }, list);
    const notFound = await dbService.find({ age: 11 }, list);

    expect(foundName[0]).toMatchObject(list[0]);
    expect(foundAge[0]).toMatchObject(list[0]);
    expect(notFound.length).toBe(0);
  });

  it('should create new item', async () => {
    const newItem = { name: 'new', age: 20 };
    const newList = [...list];
    const { newItem: returnedItem, list: returnedList } =
      await dbService.create(newItem, newList);

    expect(returnedItem.id).toBeTruthy();
    expect(returnedList.length).toBe(3);
  });

  it('should delete item by id', async () => {
    const newList = await dbService.findByIdAndDelete('1', list);

    expect(newList.length).toBe(2);
    expect(newList[0].isDeleted).toBe(true);
  });

  it('should update item by id', async () => {
    const newList = await dbService.findByIdAndUpdate(
      '1',
      {
        id: '1',
        name: 'newName',
        age: 10,
        isDeleted: false,
      },
      list
    );

    expect(newList[0].name).toBe('newName');
  });
});
