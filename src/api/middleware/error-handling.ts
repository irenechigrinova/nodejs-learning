import { NextFunction, Request, Response } from 'express';

module.exports = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) =>
  res.status
    ? res.status(500).json({ error: 'Server error', details: err })
    : next();
