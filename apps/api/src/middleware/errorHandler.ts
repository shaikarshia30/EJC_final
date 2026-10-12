import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('Unhandled API Error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof ZodError) {
    return sendError(res, 'VALIDATION_ERROR', 'Input validation failed', 422, err.errors);
  }

  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return sendError(res, 'UNAUTHORIZED', err.message || 'Authentication required', 401);
  }

  if (err.status === 403) {
    return sendError(res, 'FORBIDDEN', err.message || 'Access denied', 403);
  }

  return sendError(
    res,
    'INTERNAL_SERVER_ERROR',
    process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    err.status || 500
  );
};
