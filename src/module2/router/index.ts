import { IDataBase } from '../models/db-model';
import { TUser } from '../models/user-model';

const { Router } = require('express');
const UserController = require('../controllers/user-controller');

const validation = require('../middleware/validation');
const userPostSchema = require('../schemes/users.post.schema');
const userPutSchema = require('../schemes/users.put.schema');

module.exports = (db: IDataBase<TUser>) => {
  const appRouter = new Router();
  const userController = new UserController(db);

  appRouter.get('/users/', userController.getUsers.bind(userController));
  appRouter.get(
    '/users/:userId',
    userController.getUserById.bind(userController)
  );
  appRouter.post(
    '/users/',
    validation(userPostSchema),
    userController.createUser.bind(userController)
  );
  appRouter.put(
    '/users/:userId',
    validation(userPutSchema),
    userController.updateUser.bind(userController)
  );
  appRouter.delete(
    '/users/:userId',
    userController.softDeleteUser.bind(userController)
  );

  return appRouter;
};
