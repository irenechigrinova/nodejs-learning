import { JwtPayload } from 'jsonwebtoken';

import Token from '../entities/Token';

export interface ITokenService {
  generateTokens: (payload: Record<string, string>) => {
    accessToken: string;
    refreshToken: string;
  };

  saveToken: (userId: number, token: string) => Promise<Token | null>;
  removeToken: (token: string) => Promise<boolean | null>;
  updateRefreshToken: (
    token: string,
    user: { login: string; id: string }
  ) => Promise<{
    accessToken: string;
    refreshToken: string;
  } | null>;
  validateAccessToken: (token: string) => Promise<string | JwtPayload>;
}
