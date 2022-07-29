import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import GroupEntity from '../group/group.entity';

@Entity()
class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 30,
  })
  login: string;

  @Column({ select: false })
  password: string;

  @Column()
  age: number;

  @Column({ select: false, nullable: true })
  refreshToken: string;

  @DeleteDateColumn({ select: false })
  deletedAt?: Date | null;

  @ManyToMany(() => GroupEntity)
  @JoinTable({ name: 'user_groups' })
  groups: GroupEntity[];
}

export default UserEntity;
