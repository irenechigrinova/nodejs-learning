import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import PermissionEntity from './permission/permission.entity';
import GroupEntity from './group/group.entity';
import UserEntity from './user/user.entity';

import { PermissionModule } from './permission/permission.module';
import { GroupModule } from './group/group.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { Encryption } from './core/encryption/encryption';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: config.get<'aurora-postgres'>('TYPEORM_CONNECTION'),
        username: config.get<string>('TYPEORM_USERNAME'),
        password: config.get<string>('TYPEORM_PASSWORD'),
        database: config.get<string>('TYPEORM_DATABASE'),
        port: +config.get<number>('TYPEORM_PORT') || 1234,
        entities: [PermissionEntity, GroupEntity, UserEntity],
        synchronize: true,
      }),
    }),
    PermissionModule,
    GroupModule,
    UserModule,
    AuthModule,
    Encryption,
  ],
})
export class AppModule {}
