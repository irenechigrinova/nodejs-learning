import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EncryptionService } from '../core/encryption/encryption';

import UserEntity from './user.entity';
import GroupEntity from '../group/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity, UserEntity])],
  controllers: [UserController],
  providers: [UserService, EncryptionService],
})
export class UserModule {}
