import jwt from 'jsonwebtoken';
import environment from '../config/environment';

export class JWTUtils {
  static generateAccessToken(
    payload: any,
    options: { expiresIn: string } = { expiresIn: '1d' }
  ) {
    const { expiresIn } = options;
    return jwt.sign(payload, environment.jwtAccessTokenSecret, { expiresIn });
  }

  static generateRefreshToken(payload: any) {
    return jwt.sign(payload, environment.jwtRefreshTokenSecret);
  }

  static verifyAccessToken(accessToken: string) {
    return jwt.verify(accessToken, environment.jwtAccessTokenSecret);
  }

  static verifyRefreshToken(refreshToken: string) {
    return jwt.verify(refreshToken, environment.jwtRefreshTokenSecret);
  }
}
