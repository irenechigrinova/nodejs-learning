import {
  Entity, Column, PrimaryGeneratedColumn
} from 'typeorm';
import { EPermission } from '../types/permission.types';

@Entity()
class Permission {
    @PrimaryGeneratedColumn()
      id: number;

    @Column({
      type: 'simple-enum',
      enum: EPermission,
    })
      value: EPermission;
}

export default Permission;
