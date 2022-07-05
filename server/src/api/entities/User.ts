import {
  Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn, ManyToMany, JoinTable,
} from 'typeorm';

import Group from './Group';

@Entity()
class User {
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

  @DeleteDateColumn({ select: false })
    deletedAt?: Date | null;

  @ManyToMany(() => Group)
  @JoinTable({ name: 'user_groups' })
    groups: Group[];
}

export default User;
