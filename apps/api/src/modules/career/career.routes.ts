import { Router } from 'express';
import { CareerService } from './career.service.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenant } from '../../middleware/tenant.js';
import { requireRole } from '../../middleware/rbac.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { z } from 'zod';

const router = Router();
router.use(authenticate, enforceTenant);

// Get career readiness analysis
router.get('/readiness/:employeeId', async (req, res) => {
  try {
    const orgId = req.organizationId!;
    const analysis = await CareerService.getCareerReadiness(req.params.employeeId, orgId);
    return sendSuccess(res, analysis);
  } catch (err: any) {
    return sendError(res, 'FETCH_FAILED', err.message, 500);
  }
});

// Promote employee (HR Admin / Manager only)
const PromoteSchema = z.object({
  employeeId: z.string().uuid(),
  newTitle: z.string().min(2),
  newLevel: z.string().min(2),
});

router.post(
  '/promote',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER']),
  async (req, res) => {
    try {
      const { employeeId, newTitle, newLevel } = PromoteSchema.parse(req.body);
      const orgId = req.organizationId!;
      const actorId = req.user!.userId;
      const actorName = req.user!.email;

      const promoted = await CareerService.promoteEmployee(
        employeeId,
        orgId,
        newTitle,
        newLevel,
        actorId,
        actorName
      );

      return sendSuccess(res, promoted, 'Employee promoted successfully');
    } catch (err: any) {
      return sendError(res, 'PROMOTION_FAILED', err.message, 400);
    }
  }
);

export const careerRoutes = router;
