import { TUser } from '../types/user.types';

const db = require('../db/db');

class UserModel {
  private returningFields = 'id, login, password, age';

  private readonly table: string;

  private generateParams(item: Partial<TUser>) {
    const values = Object.entries(item);
    return values.reduce<{
      params: string[];
      values: unknown[];
    }>(
      (result, value, index) => ({
        ...result,
        params: [...result.params, `${value[0]}=$${index + 1}`],
        values: [...result.values, value[1]],
      }),
      { params: [], values: [] }
    );
  }

  constructor(table: string) {
    this.table = table;
  }

  async create(item: TUser): Promise<TUser> {
    const { login, password, age } = item;
    return db.query(
      `INSERT INTO ${this.table} (login, password, age, is_deleted) values($1, $2, $3, false) RETURNING ${this.returningFields}`,
      [login, password, age]
    );
  }

  async findByIdAndUpdate(
    id: number,
    updatedItem: Partial<TUser>
  ): Promise<TUser> {
    const generatedParams = this.generateParams(updatedItem);
    const fieldsToUpdate = generatedParams.params.join(', ');
    const idParam = generatedParams.values.length + 1;
    return db.query(
      `UPDATE ${this.table} SET ${fieldsToUpdate} WHERE id=$${idParam} AND is_deleted='F' RETURNING ${this.returningFields}`,
      [...generatedParams.values, id]
    );
  }

  async findByIdAndDelete(id: number): Promise<boolean> {
    const updatedUser = await db.query(
      `UPDATE ${this.table} SET is_deleted=true WHERE id=$1 AND is_deleted='F' RETURNING id`,
      [id]
    );
    return !!updatedUser.length;
  }

  async findByParams(
    loginSubstr: string,
    limit: number,
    offset: number
  ): Promise<{ data: TUser[]; total: number }> {
    const data = await db.query(
      `SELECT ${this.returningFields} FROM ${this.table} WHERE is_deleted='F' AND login ~ $1 ORDER BY login LIMIT $2 OFFSET $3`,
      [loginSubstr, limit, offset]
    );
    const count = await db.query(
      `SELECT count(*) as total FROM ${this.table} WHERE is_deleted='F' AND login ~ $1`,
      [loginSubstr]
    );
    return { data, total: parseInt(count[0].total, 10) };
  }

  async findById(id: number): Promise<TUser[]> {
    return db.query(
      `SELECT ${this.returningFields} FROM ${this.table} WHERE is_deleted='F' AND id=$1`,
      [id]
    );
  }
}

module.exports = UserModel;
