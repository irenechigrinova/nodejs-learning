import { IDataBase } from '../models/db-model';
import { TUser } from '../models/user-model';

const { Router } = require('express');
const UserController = require('../controllers/user-controller');

module.exports = (db: IDataBase<TUser>) => {
  const appRouter = new Router();
  const userController = new UserController(db);

  appRouter.get('/users/', userController.getUsers);
  appRouter.get('/users/autoSuggestions/', userController.getAutoSuggestUsers);
  appRouter.get('/users/:id', userController.getUserById);
  appRouter.post('/users/', userController.createUser);
  appRouter.put('/users/', userController.updateUser);
  appRouter.delete('/users/:id', userController.softDeleteUser);

  return appRouter;
};
