import { Request, Response, NextFunction } from 'express';

const errorHandling = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) =>
  res.status
    ? res.status(500).json({ error: 'Server error', details: err })
    : next();

export default errorHandling;
