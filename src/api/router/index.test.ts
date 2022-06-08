import request from 'supertest';
import express from 'express';

import routerTest from './index';
import testRepo from '../utils/repository-stub';

import UserRepository from '../repository/user-repository';

const router = routerTest(testRepo as unknown as UserRepository);

const app = express();
app.use(express.json());
app.use('/', router);

describe('Routes', () => {
  afterEach(() => {
    testRepo.reset();
  });

  test('responds to GET /users/', async () => {
    const res = await request(app).get('/users/');
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toEqual(2);
    expect(res.body.pagination.limit).toEqual(10);
    expect(res.body.pagination.offset).toEqual(0);
    expect(res.body.pagination.total).toEqual(2);
  });

  test('responds to GET /users?login=2&limit=2', async () => {
    const res = await request(app).get('/users?login=2&limit=2');
    expect(res.statusCode).toBe(200);
    expect(res.body.pagination.limit).toEqual(2);
  });

  test('responds to GET /users?offset=1 with offset', async () => {
    const res = await request(app).get('/users?offset=1');
    expect(res.statusCode).toBe(200);
    expect(res.body.pagination.offset).toEqual(1);
  });

  test('responds to GET /users/:userId', async () => {
    const res = await request(app).get('/users/2');
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toEqual(2);
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
    const res = await request(app).put('/users/2').send({ login: 'test2' });
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBeTruthy();
  });

  test('responds to PUT /users/:userId with 404', async () => {
    const res = await request(app).put('/users/1').send({ login: 'test2' });
    expect(res.statusCode).toBe(404);
  });

  test('responds to DELETE /users/:userId', async () => {
    const res = await request(app).delete('/users/2');
    expect(res.statusCode).toBe(200);
  });

  test('responds to DELETE /users/:userId with 404', async () => {
    const res = await request(app).delete('/users/1');
    expect(res.statusCode).toBe(404);
  });
});
