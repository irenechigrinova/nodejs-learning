import { Router } from 'express';

import { IUserService } from '../types/user.types';
import UserController from '../controllers/user-controller';

import validate from '../middleware/validation';

import userPostSchema from '../schemes/users.post.schema';
import userPutSchema from '../schemes/users.put.schema';
import userGroupSchema from '../schemes/user-group.schema';

const userRouter = (userService: IUserService) => {
  const appRouter = Router();
  const userController = new UserController(userService);

  appRouter.get('/', userController.getUsers.bind(userController));
  appRouter.get('/:userId', userController.getUserById.bind(userController));
  appRouter.post(
    '/',
    validate(userPostSchema),
    userController.createUser.bind(userController)
  );
  appRouter.put(
    '/:userId',
    validate(userPutSchema),
    userController.updateUser.bind(userController)
  );
  appRouter.delete(
    '/:userId',
    userController.softDeleteUser.bind(userController)
  );
  appRouter.post(
    '/add-to-group',
    validate(userGroupSchema),
    userController.addUsersToGroup.bind(userController)
  );
  appRouter.post(
    '/remove-from-group',
    validate(userGroupSchema),
    userController.removeUsersFromGroup.bind(userController)
  );

  return appRouter;
};

export default userRouter;
