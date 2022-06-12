import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import User from '../entities/User';

class CreateTable120620221300 implements MigrationInterface {
  private table = new Table({
    name: 'user',
    columns: [
      {
        name: 'id',
        type: 'integer',
        isPrimary: true,
        isGenerated: true,
        generationStrategy: 'increment',
      },
      {
        name: 'login',
        type: 'varchar',
        length: '30',
        isUnique: true,
        isNullable: false,
      },
      {
        name: 'password',
        type: 'varchar',
        length: '100',
        isNullable: false,
      },
      {
        name: 'age',
        type: 'integer',
        isNullable: false,
      },
      {
        name: 'isDeleted',
        type: 'boolean',
        isNullable: false,
      },
    ],
  });

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table);
    await queryRunner.manager.create<User>(User, {
      login: 'test',
      password: 'test123',
      age: 20,
    });
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table);
  }
}

export default CreateTable120620221300;
// npm run typeorm migration:generate -d <path/to/datasource> path/to/migrations/<migration-name>
// https://github.com/typeorm/typeorm/issues/8860
