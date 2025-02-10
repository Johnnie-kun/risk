import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Schema, ZodError } from 'zod';

export const validate = (schema: Schema): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid request data',
        errors: (error as ZodError).errors
      });
    }
  };
}; 