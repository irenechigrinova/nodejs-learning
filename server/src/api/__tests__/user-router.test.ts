import { DataSource } from 'typeorm';
import request from 'supertest';
import express from 'express';

import {
  UserRepositoryStub,
  GroupRepositoryStub,
  AppDataSourceStub,
} from '../stubs/stubs';

import userRouter from '../router/user-router';
import UserService from '../services/user-service';
import { TRepository } from '../types/common.types';

const userService = new UserService(
  UserRepositoryStub as unknown as TRepository,
  GroupRepositoryStub as unknown as TRepository,
  AppDataSourceStub as unknown as DataSource
);

const router = userRouter(userService);

const app = express();
app.use(express.json());
app.use('/api/users/', router);

describe('User Router', () => {
  afterEach(() => {
    UserRepositoryStub.reset();
  });

  test('responds to GET /users/', async () => {
    const res = await request(app).get('/api/users/');
    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toEqual(0);
    expect(res.body.pagination.limit).toEqual(10);
    expect(res.body.pagination.offset).toEqual(0);
    expect(res.body.pagination.total).toEqual(0);
  });

  test('responds to GET /users?login=2&limit=2', async () => {
    const res = await request(app).get('/api/users?login=2&limit=2');
    expect(res.statusCode).toBe(200);
    expect(res.body.pagination.limit).toEqual(2);
  });

  test('responds to GET /users?offset=1 with offset', async () => {
    const res = await request(app).get('/api/users?offset=1');
    expect(res.statusCode).toBe(200);
    expect(res.body.pagination.offset).toEqual(1);
  });

  test('responds to GET /users/:userId', async () => {
    await UserRepositoryStub.create({
      login: 'test',
      password: 'qwerty76',
      age: 10,
      groupsIds: [1],
    } as any);
    const res = await request(app).get('/api/users/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeTruthy();
    expect(res.body.data.id).toBe(1);
  });

  test('responds to GET /users/:userId with 404', async () => {
    const res = await request(app).get('/api/users/1');
    expect(res.statusCode).toBe(404);
  });

  test('responds to POST /users/', async () => {
    const res = await request(app)
      .post('/api/users/')
      .send({
        login: 'test',
        password: '123aaa',
        age: 25,
        groupsIds: [1],
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeTruthy();
    expect(res.body.data.id).toBeTruthy();
    expect(res.body.meta).toBeTruthy();
    expect(res.body.data.login).toEqual('test');
  });

  test('respond to POST /users/ should fail', async () => {
    const res = await request(app)
      .post('/api/users/')
      .send({ login: 't', password: '123', age: 0 });
    expect(res.statusCode).toBe(400);
    expect(res.body.details.login).toBeTruthy();
    expect(res.body.details.age).toBeTruthy();
    expect(res.body.details.password).toBeTruthy();
    expect(res.body.details.groupsIds).toBeTruthy();
  });

  test('responds to PUT /users/:userId', async () => {
    await UserRepositoryStub.create({
      login: 'test',
      password: 'qwerty76',
      age: 10,
      groupsIds: [1],
    } as any);
    const res = await request(app).put('/api/users/1').send({ login: 'test2' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeTruthy();
    expect(res.body.meta).toBeTruthy();
    expect(res.body.data.id).toBeTruthy();
  });

  test('responds to PUT /users/:userId with 404', async () => {
    const res = await request(app).put('/api/users/1').send({ login: 'test2' });
    expect(res.statusCode).toBe(404);
  });

  test('responds to DELETE /users/:userId', async () => {
    await UserRepositoryStub.create({
      login: 'test',
      password: 'qwerty76',
      age: 10,
      groupsIds: [1],
    } as any);
    const res = await request(app).delete('/api/users/1');
    expect(res.statusCode).toBe(200);
  });

  test('responds to DELETE /users/:userId with 404', async () => {
    const res = await request(app).delete('/api/users/1');
    expect(res.statusCode).toBe(404);
  });
});
