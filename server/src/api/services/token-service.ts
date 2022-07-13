import jwt from 'jsonwebtoken';

import { TRepository } from '../types/common.types';

class TokenService {
  readonly repository: TRepository;

  constructor(repository: TRepository) {
    this.repository = repository;
  }

  generateTokens(payload: Record<string, string>) {
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: '15d' }
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async saveToken(userId: number, token: string) {
    const existingToken = await this.repository.get(token);
    if (existingToken) {
      existingToken.token = token;
      return this.repository.update(existingToken);
    }
    return this.repository.save(userId, token);
  }

  async removeToken(token: string) {
    return this.repository.delete(token);
  }

  async updateRefreshToken(token: string, user: { login: string; id: string }) {
    const isTokenValid = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string
    );
    if (!isTokenValid) return null;

    const tokenFromDB = this.repository.get('token');
    if (!tokenFromDB) return null;

    const newTokens = this.generateTokens(user);
    tokenFromDB.token = newTokens.refreshToken;
    await this.repository.update(tokenFromDB);
    return newTokens;
  }

  async validateAccessToken(token: string) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
  }
}

export default TokenService;
