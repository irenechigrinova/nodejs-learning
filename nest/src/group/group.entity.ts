import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import PermissionEntity from '../permission/permission.entity';
import UserEntity from '../user/user.entity';

@Entity('group')
class GroupEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 30,
    unique: true,
  })
  name: string;

  @ManyToMany(() => PermissionEntity)
  @JoinTable()
  permissions: PermissionEntity[];

  @ManyToMany(() => UserEntity)
  @JoinTable({ name: 'user_groups' })
  users: UserEntity[];
}

export default GroupEntity;
