import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { sendError } from '../utils/response.js';
import { JwtPayload, UserRoleType } from '@ejc/types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      organizationId?: string;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'AUTH_REQUIRED', 'Authorization token is missing or invalid', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;
    req.organizationId = decoded.organizationId;
    next();
  } catch (err: any) {
    return sendError(res, 'TOKEN_INVALID', 'Token has expired or is invalid', 401);
  }
};
