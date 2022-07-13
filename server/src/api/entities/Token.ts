import {
  Entity, Column, PrimaryGeneratedColumn, JoinTable, PrimaryColumn, OneToOne,
} from 'typeorm';

import User from './User';

@Entity()
class Token {
    @PrimaryGeneratedColumn()
      id: number;

    @Column()
      token: string;

    @PrimaryColumn({ type: 'int' })
      user_id: number;

    @OneToOne(() => User)
    @JoinTable()
      user: User;
}

export default Token;
