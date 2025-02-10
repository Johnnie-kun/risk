import { Request, Response, NextFunction } from 'express';
import { Schema } from 'zod';

export const validate = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request data',
        errors: error.errors
      });
    }
  };
}; 