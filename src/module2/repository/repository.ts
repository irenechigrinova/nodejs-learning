const uuid = require('uuid');

class Repository<T extends { id: string }> {
  private list: T[] = [];

  find(params: Record<keyof T, any>): Promise<T[]> {
    return new Promise((resolve) => {
      resolve(
        this.list.filter((item) =>
          Object.keys(params).every(
            (key) =>
              (item as Record<keyof T, any>)[key as keyof T] ===
              params[key as keyof T]
          )
        )
      );
    });
  }

  async create(item: T): Promise<T> {
    const newItem: T = await new Promise((resolve) => {
      const newItem: T = {
        ...item,
        id: uuid.v4() as string,
      };
      resolve(newItem);
    });
    this.list.push(newItem);
    return newItem;
  }

  async findByIdAndDelete(id: string, flag: keyof T): Promise<boolean> {
    const { newList, hasBeenDeleted } = await new Promise((resolve) => {
      let hasBeenDeleted = false;
      const newList = this.list.map((item) => {
        if (item.id === id && !item[flag]) {
          hasBeenDeleted = true;
          return { ...item, [flag]: true };
        }
        return item;
      });
      resolve({ newList, hasBeenDeleted });
    });
    this.list = newList;
    return hasBeenDeleted;
  }

  async findByIdAndUpdate(
    id: string,
    updatedItem: T,
    flag: keyof T
  ): Promise<T | undefined> {
    const { newList, updated } = await new Promise((resolve) => {
      let updated;
      const newList = this.list.map((item) => {
        if (item.id === id && !item[flag]) {
          updated = { ...item, ...updatedItem };
          return updated;
        }
        return item;
      });
      resolve({
        newList,
        updated,
      });
    });
    this.list = newList;
    return updated;
  }

  truncate() {
    this.list = [];
  }
}

module.exports = Repository;
