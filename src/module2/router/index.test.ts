import request from 'supertest';
import express from 'express';

const routerTest = require('./index');
const DB = require('../controllers/db-controller');

const dbInstance = new DB();
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
    expect(res.body).toEqual([]);
  });

  test('responds to GET /users/autoSuggestions?login=test&limit=2', async () => {
    await dbInstance.create({ login: 'test', isDeleted: false });
    await dbInstance.create({ login: 'test2', isDeleted: false });
    await dbInstance.create({ login: 'test3', isDeleted: false });
    const res = await request(app).get(
      '/users/autoSuggestions?login=test&limit=2'
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  test('responds to GET /users/:id', async () => {
    const user = await dbInstance.create({ login: 'test', isDeleted: false });
    const res = await request(app).get(`/users/${user.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toEqual(user.id);
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
    expect(res.body.details.length).toBe(3);
  });

  test('responds to PUT /users/', async () => {
    const user = await dbInstance.create({ login: 'test', isDeleted: false });
    const res = await request(app)
      .put('/users/')
      .send({ id: user.id, login: 'test2' });
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBeTruthy();
    expect(res.body.login).toEqual('test2');

    const getRes = await request(app).get(`/users/${user.id}`);
    expect(getRes.body.login).toEqual('test2');
  });

  test('responds to DELETE /users/:id', async () => {
    const user = await dbInstance.create({ login: 'test', isDeleted: false });
    const res = await request(app).delete(`/users/${user.id}`);
    expect(res.statusCode).toBe(200);

    const getRes = await request(app).get(`/users/${user.id}`);
    expect(getRes.body).not.toBeTruthy();
  });
});
