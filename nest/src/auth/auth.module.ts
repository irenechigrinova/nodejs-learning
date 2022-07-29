import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EncryptionService } from '../core/encryption/encryption';

import { AccessTokenStrategy } from '../core/strategies/access-token.strategy';
import { RefreshTokenStrategy } from '../core/strategies/refresh-token.strategy';

import UserEntity from '../user/user.entity';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([UserEntity])],
  controllers: [AuthController],
  providers: [
    AuthService,
    EncryptionService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
})
export class AuthModule {}
