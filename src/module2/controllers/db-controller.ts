const DBService = require('../services/db-service');

class DBController<T extends { id: string }> {
  private list: T[] = [];

  find(params: Record<keyof T, any>) {
    return DBService.find(params, this.list);
  }

  async create(item: T) {
    const { newItem, list } = await DBService.create(item, this.list);
    this.list = list;
    return newItem;
  }

  async findByIdAndDelete(id: string) {
    this.list = await DBService.findByIdAndDelete(id, this.list);
    return null;
  }

  async findByIdAndUpdate(id: string, updatedItem: T) {
    this.list = await DBService.findByIdAndUpdate(id, updatedItem, this.list);
    return updatedItem;
  }
}

module.exports = DBController;
