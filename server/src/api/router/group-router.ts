import { Router } from 'express';

import GroupController from '../controllers/group-controller';

import { IGroupService } from '../types/group.types';

const groupRouter = (groupService: IGroupService) => {
  const appRouter = Router();
  const groupController = new GroupController(groupService);

  appRouter.get('/', groupController.getAllGroups.bind(groupController));
  appRouter.get(
    '/:groupId',
    groupController.getGroupById.bind(groupController)
  );
  appRouter.post('/', groupController.createGroup.bind(groupController));
  appRouter.put('/:groupId', groupController.updateGroup.bind(groupController));
  appRouter.delete(
    '/:groupId',
    groupController.deleteGroup.bind(groupController)
  );

  return appRouter;
};

export default groupRouter;
