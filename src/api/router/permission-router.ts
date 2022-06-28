import { Router } from 'express';

import PermissionController from '../controllers/permission-controller';

import { TRepository } from '../types/common.types';

const permissionRouter = (repository: TRepository) => {
  const appRouter = Router();
  const permissionController = new PermissionController(repository);

  appRouter.get(
    '/',
    permissionController.getAllPermissions.bind(permissionController)
  );
  appRouter.get(
    '/:permissionId',
    permissionController.getPermissionById.bind(permissionController)
  );
  appRouter.post(
    '/',
    permissionController.createPermission.bind(permissionController)
  );
  appRouter.put(
    '/:permissionId',
    permissionController.updatePermission.bind(permissionController)
  );
  appRouter.delete(
    '/:permissionId',
    permissionController.deletePermission.bind(permissionController)
  );

  return appRouter;
};

export default permissionRouter;
