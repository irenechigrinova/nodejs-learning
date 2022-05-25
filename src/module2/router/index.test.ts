import request from 'supertest';
import express from 'express';

const routerTest = require('./index');
const TestDB = require('../repository/user-repository');
const TestModel = require('../models/user-model');

const dbInstance = new TestDB(new TestModel());
const router = routerTest(dbInstance);

const app = express();
app.use(express.json());
app.use('/', router);

describe('Routes', () => {
  beforeEach(async () => {
    await dbInstance.truncate();
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
    await dbInstance.create({ login: 'test', isDeleted: false });
    await dbInstance.create({ login: 'test2', isDeleted: false });
    await dbInstance.create({ login: 'test3', isDeleted: false });
    const res = await request(app).get('/users?login=test&limit=2');
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBe(2);
    expect(res.body.pagination.limit).toEqual(2);
    expect(res.body.pagination.offset).toEqual(0);
    expect(res.body.pagination.total).toEqual(3);
  });

  test('responds to GET /users?login=test&limit=1 with limit', async () => {
    await dbInstance.create({ login: 'test', isDeleted: false });
    await dbInstance.create({ login: 'test2', isDeleted: false });
    await dbInstance.create({ login: 'test3', isDeleted: false });
    const res = await request(app).get('/users?login=test&limit=1');
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBe(1);
    expect(res.body.pagination.limit).toEqual(1);
    expect(res.body.pagination.offset).toEqual(0);
    expect(res.body.pagination.total).toEqual(3);
  });

  test('responds to GET /users?login=test&limit=2&offset=1 with offset', async () => {
    await dbInstance.create({ login: 'test', isDeleted: false });
    await dbInstance.create({ login: 'test2', isDeleted: false });
    await dbInstance.create({ login: 'test3', isDeleted: false });
    const res = await request(app).get('/users?login=test&limit=2&offset=1');
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBe(2);
    expect(res.body.pagination.limit).toEqual(2);
    expect(res.body.pagination.offset).toEqual(1);
    expect(res.body.pagination.total).toEqual(3);
  });

  test('responds to GET /users/:userId', async () => {
    const user = await dbInstance.create({ login: 'test', isDeleted: false });
    const res = await request(app).get(`/users/${user.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toEqual(user.id);
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
    const user = await dbInstance.create({ login: 'test', isDeleted: false });
    const res = await request(app)
      .put(`/users/${user.id}`)
      .send({ login: 'test2' });
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBeTruthy();
    expect(res.body.login).toEqual('test2');

    const getRes = await request(app).get(`/users/${user.id}`);
    expect(getRes.body.login).toEqual('test2');
  });

  test('responds to PUT /users/:userId with 404', async () => {
    const res = await request(app).put('/users/1').send({ login: 'test2' });
    expect(res.statusCode).toBe(404);
  });

  test('responds to DELETE /users/:userId', async () => {
    const user = await dbInstance.create({ login: 'test', isDeleted: false });
    const res = await request(app).delete(`/users/${user.id}`);
    expect(res.statusCode).toBe(200);

    const getRes = await request(app).get(`/users/${user.id}`);
    expect(getRes.statusCode).toBe(404);
  });

  test('responds to DELETE /users/:userId with 404', async () => {
    const res = await request(app).delete('/users/1');
    expect(res.statusCode).toBe(404);
  });
});
