import { Router } from 'express';

import { IUserService } from '../types/user.types';
import UserController from '../controllers/user-controller';

import validation from '../middleware/validation';

import userPostSchema from '../schemes/users.post.schema';
import userPutSchema from '../schemes/users.put.schema';
import usersAddToGroupSchema from '../schemes/users-add-to-group.schema';

const userRouter = (userService: IUserService) => {
  const appRouter = Router();
  const userController = new UserController(userService);

  appRouter.get('/', userController.getUsers.bind(userController));
  appRouter.get('/:userId', userController.getUserById.bind(userController));
  appRouter.post(
    '/',
    validation(userPostSchema),
    userController.createUser.bind(userController)
  );
  appRouter.put(
    '/:userId',
    validation(userPutSchema),
    userController.updateUser.bind(userController)
  );
  appRouter.delete(
    '/:userId',
    userController.softDeleteUser.bind(userController)
  );
  appRouter.post(
    '/add-to-group',
    validation(usersAddToGroupSchema),
    userController.addUsersToGroup.bind(userController)
  );
  appRouter.post(
    '/remove-from-group',
    validation(usersAddToGroupSchema),
    userController.removeUsersFromGroup.bind(userController)
  );

  return appRouter;
};

export default userRouter;
