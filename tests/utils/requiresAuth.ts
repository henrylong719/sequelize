import { Request, Response, NextFunction } from 'express';
import { JWTUtils } from '../../src/utils/jwt-utils';

type TokenType = 'accessToken' | 'refreshToken';

export default function requiresAuth(tokenType: TokenType = 'accessToken') {
  return function (req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const [bearer, token] = authHeader.split(' ');
        if (bearer.toLowerCase() !== 'bearer' || !token) {
          throw new Error('Bearer token malformed');
        }
        let jwt;
        switch (tokenType) {
          case 'refreshToken':
            jwt = JWTUtils.verifyRefreshToken(token);
            break;
          case 'accessToken':
            jwt = JWTUtils.verifyAccessToken(token);
            break;
          default:
            throw new Error('Invalid token type');
        }

        req.body.jwt = jwt;
        next();
      } catch (err) {
        if (err instanceof Error) {
          res.status(401).send({ success: false, message: err.message });
        } else {
          res
            .status(401)
            .send({ success: false, message: 'An unknown error occurred' });
        }
        return;
      }
    } else {
      res
        .status(401)
        .send({ success: false, message: 'Authorization header not found' });
      return;
    }
  };
}
