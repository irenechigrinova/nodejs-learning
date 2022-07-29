import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AccessTokenGuard } from '../core/guards/access-token.guard';
import { RefreshTokenGuard } from '../core/guards/refresh-token.guard';

import { EncryptionService } from '../core/encryption/encryption';
import { AuthService } from './auth.service';

import { AuthDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private encryptionService: EncryptionService,
  ) {}

  private async generateTokens(sub: number, login: string) {
    const accessToken = await this.jwtService.signAsync(
      {
        sub,
        login,
      },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: 60 * 15 },
    );
    const refreshToken = await this.jwtService.signAsync(
      {
        sub,
        login,
      },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: 60 * 60 * 24 * 7 },
    );

    return { accessToken, refreshToken };
  }

  @Post('login')
  async login(@Body() data: AuthDto) {
    const user = await this.authService.getUserByLogin(data.login);
    if (!user)
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);

    const isPassEqual = await this.encryptionService.compare(
      data.password,
      user.password,
    );
    if (!isPassEqual)
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);

    const tokens = await this.generateTokens(user.id, user.login);
    const refreshHash = await this.encryptionService.hashData(
      tokens.refreshToken,
    );
    await this.authService.updateRefreshToken(user.id, refreshHash);
    return {
      id: user.id,
      login: user.login,
      ...tokens,
    };
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  async logout(@Req() req: Request & { user: { sub: number } }) {
    const { user } = req;
    const result = await this.authService.destroyToken(user.sub);
    if (!result)
      throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED);
    return { success: true };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshToken(
    @Req() req: Request & { user: { sub: number; refreshToken: string } },
  ) {
    const { user } = req;
    const userFromDb = await this.authService.getUserById(user.sub);
    if (!userFromDb)
      throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED);

    const isValidToken = await this.encryptionService.compare(
      user.refreshToken,
      userFromDb.refreshToken,
    );
    if (!isValidToken)
      throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED);

    const tokens = await this.generateTokens(userFromDb.id, userFromDb.login);
    const refreshHash = await this.encryptionService.hashData(
      tokens.refreshToken,
    );
    await this.authService.updateRefreshToken(user.sub, refreshHash);
    return {
      id: userFromDb.id,
      login: userFromDb.login,
      ...tokens,
    };
  }
}
