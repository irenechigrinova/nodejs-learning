import request from 'supertest';
import express from 'express';
import { Pool } from 'pg';

const routerTest = require('./index');
const TestDB = require('../models/user-model');
const dbClient = require('../db/db');

const dbInstance = new TestDB('users_test');
const router = routerTest(dbInstance);

const app = express();
app.use(express.json());
app.use('/', router);

describe('Routes', () => {
  let pool: Record<string, any>;

  beforeEach(async () => {
    pool = new Pool({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'qwerty76',
      database: 'nodejs',
      max: 1,
      idleTimeoutMillis: 0,
    });
    dbClient.query = async (query: string, params: unknown[]) => {
      const { rows } = await (pool as Record<string, any>).query(query, params);
      return rows;
    };
    await dbClient.query('DROP TABLE IF EXISTS users_test', []);
    await dbClient.query(
      'CREATE TEMPORARY TABLE users_test (LIKE users INCLUDING ALL)',
      []
    );
  });

  afterEach(async () => {
    await pool.end();
  });

  test('responds to GET /users/', async () => {
    const res = await request(app).get('/users/');
    expect(res.statusCode).toBe(200);
    expect(res.body.users).toEqual([]);
    expect(res.body.pagination.limit).toEqual(10);
    expect(res.body.pagination.offset).toEqual(0);
    expect(res.body.pagination.total).toEqual(0);
  });

  test('responds to GET /users?login=test&limit=2', async () => {
    await dbInstance.create({ login: 'test', age: 20, password: 'qwerty123' });
    await dbInstance.create({ login: 'test2', age: 20, password: 'qwerty123' });
    await dbInstance.create({ login: 'test3', age: 20, password: 'qwerty123' });
    const res = await request(app).get('/users?login=test&limit=2');
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBe(2);
    expect(res.body.pagination.limit).toEqual(2);
    expect(res.body.pagination.offset).toEqual(0);
    expect(res.body.pagination.total).toEqual(3);
  });

  test('responds to GET /users?login=test&limit=1 with limit', async () => {
    await dbInstance.create({ login: 'test', age: 20, password: 'qwerty123' });
    await dbInstance.create({ login: 'test2', age: 20, password: 'qwerty123' });
    await dbInstance.create({ login: 'test3', age: 20, password: 'qwerty123' });
    const res = await request(app).get('/users?login=test&limit=1');
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBe(1);
    expect(res.body.pagination.limit).toEqual(1);
    expect(res.body.pagination.offset).toEqual(0);
    expect(res.body.pagination.total).toEqual(3);
  });

  test('responds to GET /users?login=test&limit=2&offset=1 with offset', async () => {
    await dbInstance.create({ login: 'test', age: 20, password: 'qwerty123' });
    await dbInstance.create({ login: 'test2', age: 20, password: 'qwerty123' });
    await dbInstance.create({ login: 'test3', age: 20, password: 'qwerty123' });
    const res = await request(app).get('/users?login=test&limit=2&offset=1');
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBe(2);
    expect(res.body.pagination.limit).toEqual(2);
    expect(res.body.pagination.offset).toEqual(1);
    expect(res.body.pagination.total).toEqual(3);
  });

  test('responds to GET /users/:userId', async () => {
    const reqApp = request(app);
    const postRes = await reqApp
      .post('/users/')
      .send({ login: 'test', password: '123aaa', age: 25 });
    const res = await reqApp.get(`/users/${postRes.body.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toEqual(postRes.body.id);
  });

  test('responds to GET /users/:userId with 404', async () => {
    const res = await request(app).get('/users/1');
    expect(res.statusCode).toBe(404);
  });

  test('responds to POST /users/', async () => {
    const res = await request(app)
      .post('/users/')
      .send({ login: 'test', password: '123aaa', age: 25 });
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBeTruthy();
    expect(res.body.login).toEqual('test');
  });

  test('respond to POST /users/ should fail', async () => {
    const res = await request(app)
      .post('/users/')
      .send({ login: 't', password: '123', age: 0 });
    expect(res.statusCode).toBe(400);
    expect(res.body.details.login).toBeTruthy();
    expect(res.body.details.age).toBeTruthy();
    expect(res.body.details.password).toBeTruthy();
  });

  test('responds to PUT /users/:userId', async () => {
    const postRes = await request(app)
      .post('/users/')
      .send({ login: 'test', password: '123aaa', age: 25 });
    const res = await request(app)
      .put(`/users/${postRes.body.id}`)
      .send({ login: 'test2' });
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBeTruthy();
    expect(res.body.login).toEqual('test2');

    const getRes = await request(app).get(`/users/${postRes.body.id}`);
    expect(getRes.body.login).toEqual('test2');
  });

  test('responds to PUT /users/:userId with 404', async () => {
    const res = await request(app).put('/users/1').send({ login: 'test2' });
    expect(res.statusCode).toBe(404);
  });

  test('responds to DELETE /users/:userId', async () => {
    const postRes = await request(app)
      .post('/users/')
      .send({ login: 'test', password: '123aaa', age: 25 });
    const res = await request(app).delete(`/users/${postRes.body.id}`);
    expect(res.statusCode).toBe(200);

    const getRes = await request(app).get(`/users/${postRes.body.id}`);
    expect(getRes.statusCode).toBe(404);
  });

  test('responds to DELETE /users/:userId with 404', async () => {
    const res = await request(app).delete('/users/1');
    expect(res.statusCode).toBe(404);
  });
});
