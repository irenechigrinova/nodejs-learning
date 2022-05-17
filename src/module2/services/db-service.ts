const uuid = require('uuid');

class DbService {
  static find<T>(params: Partial<T>, list: T[]) {
    return new Promise((resolve) => {
      resolve(
        list.filter((item) =>
          Object.keys(params).every(
            (key) =>
              (item as Record<keyof T, any>)[key as keyof T] ===
              params[key as keyof T]
          )
        )
      );
    });
  }

  static create<T>(item: T, list: T[]) {
    return new Promise((resolve) => {
      const newItem: T = {
        ...item,
        id: uuid.v4() as string,
      };
      list.push(newItem);
      resolve({ newItem, list });
    });
  }

  static findByIdAndDelete<T extends { id: string }>(id: string, list: T[]) {
    return new Promise((resolve) => {
      resolve(
        list.map((item) =>
          item.id === id ? { ...item, isDeleted: true } : item
        )
      );
    });
  }

  static findByIdAndUpdate<T extends { id: string }>(
    id: string,
    updatedItem: T,
    list: T[]
  ) {
    return new Promise((resolve) => {
      resolve(
        list.map((item) =>
          item.id === id ? { ...item, ...updatedItem } : item
        )
      );
    });
  }
}

module.exports = DbService;
