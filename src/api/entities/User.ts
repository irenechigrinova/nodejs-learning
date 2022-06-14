import {
  Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn
} from 'typeorm';

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
}

export default User;
