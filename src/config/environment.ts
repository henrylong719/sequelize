export = {
  port: parseInt(process.env.PORT || '8080') || 8080,
  nodeEnv: process.env.NODE_ENV || 'production',
  saltRounds: parseInt(process.env.SALT_ROUNDS || '10') || 10,
  jwtAccessTokenSecret:
    process.env.JWT_ACCESS_TOKEN_SECRET ||
    '04faedf5-6943-49d0-ba93-6293e832f3e9',
  jwtRefreshTokenSecret:
    process.env.JWT_REFRESH_TOKEN_SECRET ||
    'ce5cdc6d-ff2b-408d-8e1d-e0bfb0f22164',
};
