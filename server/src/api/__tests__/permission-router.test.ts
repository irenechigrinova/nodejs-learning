import request from 'supertest';
import express from 'express';

import { PermissionRepositoryStub } from '../stubs/stubs';

import permissionRouter from '../router/permission-router';
import { TRepository } from '../types/common.types';
import { EPermission } from '../types/permission.types';

const router = permissionRouter(
  PermissionRepositoryStub as unknown as TRepository
);

const app = express();
app.use(express.json());
app.use('/api/permissions/', router);

describe('Permission Router', () => {
  afterEach(() => {
    PermissionRepositoryStub.reset();
  });

  test('responds to GET /permissions/', async () => {
    const res = await request(app).get('/api/permissions/');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });

  test('responds to GET /permissions/:permissionId', async () => {
    await PermissionRepositoryStub.create('READ' as EPermission);
    const res = await request(app).get('/api/permissions/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(1);
  });

  test('responds to GET /permissions/:permissionId with 404', async () => {
    const res = await request(app).get('/api/permissions/1');
    expect(res.statusCode).toBe(404);
  });

  test('responds to POST /permissions/', async () => {
    const res = await request(app).post('/api/permissions/').send({
      value: 'READ',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeTruthy();
    expect(res.body.id).toBeTruthy();
  });

  test('responds to PUT /permissions/:permissionId', async () => {
    await PermissionRepositoryStub.create('READ' as EPermission);
    const res = await request(app)
      .put('/api/permissions/1')
      .send({ value: 'WRITE' });
    expect(res.statusCode).toBe(200);
  });

  test('responds to PUT /permissions/:permissionId with 404', async () => {
    const res = await request(app)
      .put('/api/permissions/1')
      .send({ value: 'WRITE' });
    expect(res.statusCode).toBe(404);
  });

  test('responds to DELETE /permissions/:permissionId', async () => {
    await PermissionRepositoryStub.create('READ' as EPermission);
    const res = await request(app).delete('/api/permissions/1');
    expect(res.statusCode).toBe(200);
  });

  test('responds to DELETE /permissions/:permissionId with 404', async () => {
    const res = await request(app).delete('/api/permissions/1');
    expect(res.statusCode).toBe(404);
  });
});
