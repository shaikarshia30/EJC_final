import { Router } from 'express';
import { AnalyticsService } from './analytics.service.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenant } from '../../middleware/tenant.js';
import { requireRole } from '../../middleware/rbac.js';
import { sendSuccess, sendError } from '../../utils/response.js';

const router = Router();
router.use(authenticate, enforceTenant);

// HR Analytics dashboard
router.get(
  '/hr',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER']),
  async (req, res) => {
    try {
      const orgId = req.organizationId!;
      const data = await AnalyticsService.getHRAnalytics(orgId);
      return sendSuccess(res, data);
    } catch (err: any) {
      return sendError(res, 'FETCH_FAILED', err.message, 500);
    }
  }
);

// Manager team analytics
router.get(
  '/manager',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER', 'MANAGER']),
  async (req, res) => {
    try {
      const orgId = req.organizationId!;
      const managerEmpId = req.user?.employeeId;
      if (!managerEmpId) {
        return sendError(res, 'NOT_A_MANAGER', 'User has no associated employee record', 400);
      }

      const data = await AnalyticsService.getManagerAnalytics(managerEmpId, orgId);
      return sendSuccess(res, data);
    } catch (err: any) {
      return sendError(res, 'FETCH_FAILED', err.message, 500);
    }
  }
);

export const analyticsRoutes = router;
