import { DataSource } from 'typeorm';

import User from './entities/User';
import Group from './entities/Group';
import Permission from './entities/Permission';
import Token from './entities/Token';
import UserGroup from './entities/UserGroups';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT ? +process.env.DB_PORT : 5432,
  username: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nodejs',
  entities: [User, Group, Permission, UserGroup, Token],
  migrations: ['migrations/*.ts'],
  synchronize: true,
  logging: false,
});

export default AppDataSource;
