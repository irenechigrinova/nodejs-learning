import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { PERMISSIONS } from './permission.dto';

@Entity('permission')
class PermissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'simple-enum',
    enum: PERMISSIONS,
  })
  value: PERMISSIONS;
}

export default PermissionEntity;
