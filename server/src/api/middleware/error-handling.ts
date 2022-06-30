import { Request, Response, NextFunction } from 'express';

const errorHandling = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err, req, res, next);
  return res.status
    ? res.status(500).json({ error: 'Server error', details: err })
    : next();
};

export default errorHandling;
