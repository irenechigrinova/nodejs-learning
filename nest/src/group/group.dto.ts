import {
  IsArray,
  IsNumber,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class GroupDto {
  @IsNotEmpty()
  @IsString({ message: 'Name must be string' })
  @MinLength(3, {
    message: 'Group name is too short',
  })
  @MaxLength(20, {
    message: 'Group name is too long',
  })
  name: string;

  @IsNotEmpty()
  @IsArray({ message: 'PermissionsIds must be an array' })
  @IsNumber({}, { each: true, message: 'Not a valid value for permission id' })
  permissionsIds: number[];
}
