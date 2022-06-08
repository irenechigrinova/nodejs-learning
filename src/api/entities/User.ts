import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 30,
    unique: true,
  })
  login: string;

  @Column()
  password: string;

  @Column()
  age: number;

  @Column()
  isDeleted: boolean;
}

export default User;
