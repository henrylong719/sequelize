import { Request, Response, NextFunction } from 'express';

export default function errorsMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error in errors middleware:\n', err.stack);
  res.status(500).send({ success: false, message: err.message });
}
