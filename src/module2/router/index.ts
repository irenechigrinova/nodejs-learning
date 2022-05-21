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

  appRouter.get('/users/', userController.getUsers);
  appRouter.get('/users/autoSuggestions/', userController.getAutoSuggestUsers);
  appRouter.get('/users/:userId', userController.getUserById);
  appRouter.post(
    '/users/',
    validation(userPostSchema),
    userController.createUser
  );
  appRouter.put(
    '/users/:userId',
    validation(userPutSchema),
    userController.updateUser
  );
  appRouter.delete('/users/:userId', userController.softDeleteUser);

  return appRouter;
};
