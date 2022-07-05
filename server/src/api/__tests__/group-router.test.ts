import request from 'supertest';
import express from 'express';

import { PermissionRepositoryStub, GroupRepositoryStub } from '../stubs/stubs';

import groupRouter from '../router/group-router';
import GroupService from '../services/group-service';
import { TRepository } from '../types/common.types';

const groupService = new GroupService(
  GroupRepositoryStub as unknown as TRepository,
  PermissionRepositoryStub as unknown as TRepository
);

const router = groupRouter(groupService);

const app = express();
app.use(express.json());
app.use('/api/groups/', router);

describe('Group Router', () => {
  afterEach(() => {
    GroupRepositoryStub.reset();
  });

  test('responds to GET /groups/', async () => {
    const res = await request(app).get('/api/groups/');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeTruthy();
    expect(res.body.meta).toBeTruthy();
  });

  test('responds to GET /groups/:groupId', async () => {
    await GroupRepositoryStub.create('test', [1]);
    const res = await request(app).get('/api/groups/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeTruthy();
    expect(res.body.data.id).toBe(1);
  });

  test('responds to GET /groups/:groupId with 404', async () => {
    const res = await request(app).get('/api/groups/1');
    expect(res.statusCode).toBe(404);
  });

  test('responds to POST /groups/', async () => {
    const res = await request(app)
      .post('/api/groups/')
      .send({
        name: 'test',
        permissionsIds: [1],
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeTruthy();
    expect(res.body.data.id).toBeTruthy();
    expect(res.body.meta).toBeTruthy();
  });

  test('responds to PUT /groups/:groupId', async () => {
    await GroupRepositoryStub.create('test', [1]);
    const res = await request(app).put('/api/groups/1').send({ name: 'test2' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeTruthy();
    expect(res.body.meta).toBeTruthy();
    expect(res.body.data.id).toBeTruthy();
  });

  test('responds to PUT /groups/:groupId with 404', async () => {
    const res = await request(app).put('/api/groups/1').send({ name: 'test2' });
    expect(res.statusCode).toBe(404);
  });

  test('responds to DELETE /groups/:groupId', async () => {
    await GroupRepositoryStub.create('test', [1]);
    const res = await request(app).delete('/api/groups/1');
    expect(res.statusCode).toBe(200);
  });

  test('responds to DELETE /users/:userId with 404', async () => {
    const res = await request(app).delete('/api/groups/1');
    expect(res.statusCode).toBe(404);
  });
});
