import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GroupController } from './group.controller';
import { GroupService } from './group.service';

import GroupEntity from './group.entity';
import PermissionEntity from '../permission/permission.entity';
import UserEntity from '../user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupEntity, PermissionEntity, UserEntity]),
  ],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
