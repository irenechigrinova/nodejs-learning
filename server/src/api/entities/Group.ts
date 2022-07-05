import {
  Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable
} from 'typeorm';

import Permission from './Permission';
import User from './User';

@Entity()
class Group {
    @PrimaryGeneratedColumn()
      id: number;

    @Column({
      length: 30,
      unique: true,
    })
      name: string;

    @ManyToMany(() => Permission)
    @JoinTable()
      permissions: Permission[];

    @ManyToMany(() => User)
    @JoinTable({ name: 'user_groups' })
      users: User[];
}

export default Group;
