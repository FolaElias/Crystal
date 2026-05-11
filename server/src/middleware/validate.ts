import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './errorHandler';

export function validate(req: Request, _res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const grouped: Record<string, string[]> = {};
    errors.array().forEach((err) => {
      const field = err.type === 'field' ? err.path : 'general';
      if (!grouped[field]) grouped[field] = [];
      grouped[field].push(err.msg);
    });
    return next(new AppError('Validation failed', 422, grouped));
  }
  next();
}
