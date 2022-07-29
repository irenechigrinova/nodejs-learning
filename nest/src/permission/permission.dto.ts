import { IsEnum, IsNotEmpty } from 'class-validator';

export enum PERMISSIONS {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  SHARE = 'SHARE',
  UPLOAD_FILES = 'UPLOAD_FILES',
}

export class PermissionDto {
  @IsNotEmpty()
  @IsEnum(PERMISSIONS, { message: 'Not a valid permission value' })
  public value: PERMISSIONS;
}
