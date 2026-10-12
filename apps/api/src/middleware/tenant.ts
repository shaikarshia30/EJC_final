import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

export const enforceTenant = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return sendError(res, 'AUTH_REQUIRED', 'Authentication required for tenant verification', 401);
  }

  // Super Admins can bypass single-tenant restriction for cross-tenant operations
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  const requestedOrgId = 
    req.params.organizationId || 
    req.query.organizationId || 
    req.body.organizationId;

  if (requestedOrgId && requestedOrgId !== req.user.organizationId) {
    return sendError(
      res,
      'TENANT_ACCESS_DENIED',
      'Cross-tenant data access is strictly prohibited',
      403
    );
  }

  // Ensure organizationId is always stamped onto the request
  req.organizationId = req.user.organizationId;
  next();
};
