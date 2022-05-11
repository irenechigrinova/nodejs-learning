const uuid = require('uuid');

class DBController<T extends { id: string }> {
  private list: T[] = [];

  find(params: Record<keyof T, any>) {
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

  create(item: T) {
    return new Promise((resolve) => {
      const newItem: T = {
        ...item,
        id: uuid.v4() as string,
      };
      this.list.push(newItem);
      resolve(newItem);
    });
  }

  findByIdAndDelete(id: string) {
    return new Promise((resolve) => {
      this.list = this.list.map((item) =>
        item.id === id ? { ...item, isDeleted: true } : item
      );
      resolve(null);
    });
  }

  findByIdAndUpdate(id: string, updatedItem: T) {
    return new Promise((resolve) => {
      this.list = this.list.map((item) =>
        item.id === id ? updatedItem : item
      );
      resolve(updatedItem);
    });
  }
}

module.exports = DBController;
