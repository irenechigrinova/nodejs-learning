import { Request, Response } from 'express';

import { TPermission, EPermission } from '../types/permission.types';
import { TRepository } from '../types/common.types';

class PermissionController {
  readonly repository: TRepository;

  constructor(permissionRepository: TRepository) {
    this.repository = permissionRepository;
  }

  async createPermission(req: Request, res: Response) {
    const { value } = req.body;
    const newPermission: TPermission | undefined = await this.repository.create(
      value as EPermission
    );
    res.json(newPermission);
  }

  async updatePermission(req: Request, res: Response) {
    const { value } = req.body;
    const { permissionId } = req.params;
    const updatedPermission = await this.repository.findByIdAndUpdate(
      +permissionId,
      value as EPermission
    );
    if (updatedPermission) {
      res.json(updatedPermission);
    } else {
      res.status(404).json({
        error: 'No entity found',
        details: {
          userId: `Cannot update permission. No permission with id ${permissionId} found`,
        },
      });
    }
  }

  async deletePermission(req: Request, res: Response) {
    const { permissionId } = req.params;
    const result = await this.repository.findByIdAndDelete(+permissionId);
    if (result) {
      res.json({ success: true });
    } else {
      res.status(404).json({
        error: 'No entity found',
        details: {
          userId: `Cannot delete permission. No permission with id ${permissionId} found`,
        },
      });
    }
  }

  async getPermissionById(req: Request, res: Response) {
    const { permissionId } = req.params;
    const result = await this.repository.findById(+permissionId);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({
        error: 'No entity found',
        details: {
          userId: `No permission with id ${permissionId} found`,
        },
      });
    }
  }

  async getAllPermissions(req: Request, res: Response) {
    const permissions = await this.repository.findAll();
    return res.json(permissions);
  }

  async getAllPermissionsById(req: Request, res: Response) {
    const { permissionsIds } = req.body;
    const permissions = await this.repository.findAll();
    return res.json(permissions);
  }
}

export default PermissionController;
