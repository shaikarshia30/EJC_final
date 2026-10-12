import { Request } from 'express';
import { prisma } from '../database/prisma.js';
import { logger } from '../utils/logger.js';

export interface AuditLogOptions {
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
}

export const logAuditEvent = async (
  req: Request,
  options: AuditLogOptions
) => {
  try {
    const orgId = req.organizationId || req.user?.organizationId;
    const actorId = req.user?.userId;

    if (!orgId || !actorId) {
      return; // Skip if unauthenticated
    }

    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        actorId,
        action: options.action,
        resource: options.resource,
        resourceId: options.resourceId,
        oldValue: options.oldValue ? (options.oldValue as any) : undefined,
        newValue: options.newValue ? (options.newValue as any) : undefined,
        ipAddress: typeof ipAddress === 'string' ? ipAddress : undefined,
        userAgent,
      },
    });
  } catch (err) {
    logger.warn('Failed to record audit log', { err, action: options.action });
  }
};
