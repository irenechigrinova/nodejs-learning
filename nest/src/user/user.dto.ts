import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  Min,
  Max,
  IsNumber,
  IsArray,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class UserPostDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3, {
    message: 'Login is too short',
  })
  @MaxLength(20, {
    message: 'Login is too long',
  })
  public login: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5, {
    message: 'Password is too short',
  })
  @MaxLength(50, {
    message: 'Password is too long',
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak',
  })
  public password: string;

  @IsNotEmpty()
  @IsNumber({}, { message: 'Age must be number' })
  @Min(0, { message: 'Age cannot be less than 0' })
  @Max(120, { message: 'Age cannot be more than 120' })
  public age: number;

  @IsNotEmpty()
  @IsArray({ message: 'GroupsIds must be an array' })
  @IsNumber({}, { each: true, message: 'Not a valid value for group id' })
  groupsIds: number[];
}

export class UserPutDto {
  @IsOptional()
  @IsString()
  @MinLength(3, {
    message: 'Login is too short',
  })
  @MaxLength(20, {
    message: 'Login is too long',
  })
  public login: string;

  @IsOptional()
  @IsString()
  @MinLength(5, {
    message: 'Password is too short',
  })
  @MaxLength(50, {
    message: 'Password is too long',
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak',
  })
  public password: string;

  @IsOptional()
  @IsNumber({}, { message: 'Age must be number' })
  @Min(0, { message: 'Age cannot be less than 0' })
  @Max(120, { message: 'Age cannot be more than 120' })
  public age: number;

  @IsOptional()
  @IsArray({ message: 'GroupsIds must be an array' })
  @IsNumber({}, { each: true, message: 'Not a valid value for group id' })
  groupsIds: number[];
}

export class UserGroupDto {
  @IsNotEmpty()
  @IsArray({ message: 'UsersIds must be an array' })
  @IsNumber({}, { each: true, message: 'Not a valid value for user id' })
  usersIds: number[];
}
