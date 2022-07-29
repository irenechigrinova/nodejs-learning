import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  @IsString({ message: 'Name must be string' })
  login: string;

  @IsNotEmpty()
  @IsString({ message: 'Password must be string' })
  password: string;
}
