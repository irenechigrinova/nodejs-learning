const testRepo = {
  list: [
    { id: 2, login: '2' },
    { id: 3, login: '3' },
  ],
  async findById(id: number) {
    return new Promise((resolve) => {
      resolve(id ? this.list.find((item) => item.id === id) : undefined);
    });
  },
  async findByParams() {
    return new Promise((resolve) => {
      resolve({ data: this.list, total: 2 });
    });
  },
  async create(entity: any) {
    return new Promise((resolve) => {
      resolve({ ...entity, id: 1 });
    });
  },
  async findByIdAndDelete(id: number) {
    return new Promise((resolve) => {
      resolve(this.list.some((item) => item.id === id));
    });
  },
  async findByIdAndUpdate(id: number, entity: Record<string, unknown>) {
    return new Promise((resolve) => {
      resolve(this.list.find((item) => item.id === id));
    });
  },
  reset() {
    this.list = [
      { id: 2, login: '2' },
      { id: 3, login: '3' },
    ];
  },
};

export default testRepo;
