import { Request, Response } from 'express';

import { IGroupService } from '../types/group.types';

class GroupController {
  private service;

  constructor(service: IGroupService) {
    this.service = service;
  }

  async createGroup(req: Request, res: Response) {
    const { name, permissionsIds } = req.body;
    const group = await this.service.createGroup(name, permissionsIds);
    res.json(group);
  }

  async updateGroup(req: Request, res: Response) {
    const { name, permissionsIds } = req.body;
    const { groupId } = req.params;
    const updatedGroup = await this.service.updateGroup(
      name,
      permissionsIds,
      +groupId
    );
    if (updatedGroup) {
      res.json(updatedGroup);
    } else {
      res.status(404).json({
        error: 'No entity found',
        details: {
          userId: `Cannot update group. No group with id ${groupId} found`,
        },
      });
    }
  }

  async deleteGroup(req: Request, res: Response) {
    const { groupId } = req.params;
    const result = await this.service.deleteGroup(+groupId);
    if (result) {
      res.json({ success: true });
    } else {
      res.status(404).json({
        error: 'No entity found',
        details: {
          userId: `Cannot delete group. No group with id ${groupId} found`,
        },
      });
    }
  }

  async getGroupById(req: Request, res: Response) {
    const { groupId } = req.params;
    const result = await this.service.getGroupById(+groupId);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({
        error: 'No entity found',
        details: {
          userId: `No group with id ${groupId} found`,
        },
      });
    }
  }

  async getAllGroups(req: Request, res: Response) {
    const groups = await this.service.getAllGroups();
    res.json(groups);
  }
}

export default GroupController;
