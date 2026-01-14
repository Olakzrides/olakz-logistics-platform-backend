import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import ResponseUtil from '../utils/response';

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
        type: detail.type,
        context: detail.context,
      }));

      return ResponseUtil.error(
        res,
        'Validation error',
        400,
        'VALIDATION_ERROR',
        details
      );
    }

    req.body = value;
    return next();
  };
};
