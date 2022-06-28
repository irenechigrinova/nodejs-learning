import { TPermission } from './permission.types';

export type TGroup = {
  id: number;
  name: string;
  permissions: TPermission[];
};

export type TGroupReturnType = {
  id: number;
  name: string;
  permissions: number[];
};

export type TReturnData = {
  data: TGroupReturnType | TGroupReturnType[];
  meta: {
    permissions: TPermission[];
  };
};

export interface IGroupService {
  createGroup: (name: string, permissionsIds: number[]) => Promise<TReturnData>;
  updateGroup: (
    name: string,
    permissionsIds: number[],
    groupId: number
  ) => Promise<TReturnData | undefined>;
  deleteGroup: (groupId: number) => Promise<boolean>;
  getGroupById: (groupId: number) => Promise<TReturnData | undefined>;
  getAllGroups: () => Promise<TReturnData>;
}
