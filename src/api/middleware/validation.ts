import { NextFunction, Request, Response } from 'express';
import { Schema } from 'joi';

module.exports =
  (schema: Schema) => (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error?.isJoi) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.details.reduce(
          (result, { message, path }) => ({ ...result, [path[0]]: message }),
          {}
        ),
      });
    } else {
      next();
    }
  };
