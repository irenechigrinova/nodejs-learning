import { Router } from 'express';

import UserController from '../controllers/user-controller';
import UserRepository from '../repository/user-repository';

import validation from '../middleware/validation';

import userPostSchema from '../schemes/users.post.schema';
import userPutSchema from '../schemes/users.put.schema';

const router = (userRepository: UserRepository) => {
  // @ts-ignore
  const appRouter = new Router();
  const userController = new UserController(userRepository);

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

export default router;
