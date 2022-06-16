import { DataSource } from 'typeorm';

import User from './entities/User';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT ? +process.env.DB_PORT : 5432,
  username: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nodejs',
  entities: [User],
  migrations: ['migrations/*.ts'],
  synchronize: true,
  logging: false,
});

export default AppDataSource;
