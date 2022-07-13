import { Request, Response, NextFunction } from 'express';
import { ITokenService } from '../types/token.types';

const auth = (tokenService: ITokenService) =>
  // eslint-disable-next-line func-names
  async function (req: Request, res: Response, next: NextFunction) {
    if (
      req.originalUrl.indexOf('users/login') !== -1 ||
      req.originalUrl.indexOf('users/logout') !== -1
    ) {
      next();
    } else {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          res.status(403).json({
            error: 'Not authorized',
            details: {},
          });
          return;
        }
        const accessToken = authHeader!.split(' ')[1];
        if (!accessToken) {
          res.status(403).json({
            error: 'Not authorized',
            details: {},
          });
          return;
        }
        const isValidToken = await tokenService.validateAccessToken(
          accessToken
        );
        if (!isValidToken) {
          res.status(403).json({
            error: 'Token is not valid',
            details: {},
          });
          return;
        }
        next();
      } catch (e) {
        res.status(403).json({
          error: 'Not authorized',
          details: {},
        });
      }
    }
  };

export default auth;
