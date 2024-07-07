import { Request, Response, NextFunction } from 'express';
import { JWTUtils } from '../utils/jwt-utils';

type TokenType = 'accessToken' | 'refreshToken';

export default function requiresAuth(tokenType: TokenType = 'accessToken') {
  return function (req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        var [bearer, token] = authHeader.split(' ');
        if (bearer.toLowerCase() !== 'bearer' || !token) {
          throw Error;
        }
      } catch (err) {
        res
          .status(401)
          .send({ success: false, message: 'Bearer token malformed' });
        return;
      }
    } else {
      res
        .status(401)
        .send({ success: false, message: 'Authorization header not found' });

      return;
    }

    try {
      let jwt;
      switch (tokenType) {
        case 'refreshToken':
          jwt = JWTUtils.verifyRefreshToken(token);
          break;
        case 'accessToken':
          jwt = JWTUtils.verifyAccessToken(token);
          break;
      }
      req.body.jwt = jwt;
      next();
    } catch (err) {
      res.status(401).send({ success: false, message: 'Invalid token' });
      return;
    }
  };
}
