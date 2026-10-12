import { Request, Response, NextFunction } from 'express';
import { UserRoleType } from '@ejc/types';
import { sendError } from '../utils/response.js';

export const requireRole = (allowedRoles: UserRoleType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'AUTH_REQUIRED', 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        'FORBIDDEN',
        `Role '${req.user.role}' is not authorized for this resource. Required: ${allowedRoles.join(', ')}`,
        403
      );
    }

    next();
  };
};
