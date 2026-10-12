import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenant } from '../../middleware/tenant.js';
import { requireRole } from '../../middleware/rbac.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { prisma } from '../../database/prisma.js';

const router = Router();
router.use(authenticate, enforceTenant);

// View organization audit logs (Admin only)
router.get(
  '/',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER']),
  async (req, res) => {
    try {
      const logs = await prisma.auditLog.findMany({
        where: { organizationId: req.organizationId! },
        include: {
          actor: { select: { email: true, role: true } },
        },
        orderBy: { timestamp: 'desc' },
        take: 50,
      });

      return sendSuccess(res, logs);
    } catch (err: any) {
      return sendError(res, 'FETCH_FAILED', err.message, 500);
    }
  }
);

export const auditRoutes = router;
