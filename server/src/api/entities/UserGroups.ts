import {
  Entity, PrimaryGeneratedColumn, PrimaryColumn, OneToOne, JoinTable
} from 'typeorm';

import User from './User';
import Group from './Group';

@Entity()
class UserGroup {
    @PrimaryGeneratedColumn()
      id: number;

    @PrimaryColumn({ type: 'int' })
      user_id: number;

    @PrimaryColumn({ type: 'int' })
      group_id: number;

    @OneToOne(() => User)
    @JoinTable()
      user: User;

    @OneToOne(() => Group)
    @JoinTable()
      group: Group;
}

export default UserGroup;
