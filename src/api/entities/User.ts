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

  @Column()
    password: string;

  @Column()
    age: number;

  @DeleteDateColumn({ select: false })
    deletedAt?: Date | null;

  @ManyToMany(() => Group)
  @JoinTable()
    groups: Group[];
}

export default User;
