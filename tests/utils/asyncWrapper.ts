import { Request, Response, NextFunction } from 'express';

type AsyncMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;
export default function asyncWrapper(callback: AsyncMiddleware) {
  return function (req: Request, res: Response, next: NextFunction) {
    callback(req, res, next).catch(next);
  };
}
