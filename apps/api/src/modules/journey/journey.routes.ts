import { Router } from 'express';
import { JourneyService } from './journey.service.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenant } from '../../middleware/tenant.js';
import { validateBody } from '../../middleware/validate.js';
import { CreateJourneyEventSchema } from '@ejc/validation';
import { sendSuccess, sendError } from '../../utils/response.js';
import { logAuditEvent } from '../../middleware/audit.js';

const router = Router();
router.use(authenticate, enforceTenant);

// Get employee journey timeline
router.get('/:employeeId', async (req, res) => {
  try {
    const orgId = req.organizationId!;
    const targetEmployeeId = req.params.employeeId;
    const currentEmployeeId = req.user!.employeeId;
    const userRole = req.user!.role;

    if (userRole === 'EMPLOYEE' && targetEmployeeId !== currentEmployeeId) {
      return sendError(res, 'FORBIDDEN', 'Employees can only view their own journey timeline', 403);
    }

    if (userRole === 'MANAGER' && targetEmployeeId !== currentEmployeeId) {
      const isDirectReport = await JourneyService.isManagerOf(currentEmployeeId!, targetEmployeeId, orgId);
      if (!isDirectReport) {
        return sendError(res, 'FORBIDDEN', 'Managers can only view journey timelines for direct reports', 403);
      }
    }

    const timeline = await JourneyService.getTimeline(targetEmployeeId, orgId);
    return sendSuccess(res, timeline);
  } catch (err: any) {
    return sendError(res, 'FETCH_FAILED', err.message, 500);
  }
});

// Get employee journey progression stats
router.get('/:employeeId/stats', async (req, res) => {
  try {
    const orgId = req.organizationId!;
    const targetEmployeeId = req.params.employeeId;
    const currentEmployeeId = req.user!.employeeId;
    const userRole = req.user!.role;

    if (userRole === 'EMPLOYEE' && targetEmployeeId !== currentEmployeeId) {
      return sendError(res, 'FORBIDDEN', 'Employees can only view their own journey stats', 403);
    }

    if (userRole === 'MANAGER' && targetEmployeeId !== currentEmployeeId) {
      const isDirectReport = await JourneyService.isManagerOf(currentEmployeeId!, targetEmployeeId, orgId);
      if (!isDirectReport) {
        return sendError(res, 'FORBIDDEN', 'Managers can only view journey stats for direct reports', 403);
      }
    }

    const stats = await JourneyService.getJourneyStats(targetEmployeeId, orgId);
    return sendSuccess(res, stats);
  } catch (err: any) {
    return sendError(res, 'FETCH_FAILED', err.message, 500);
  }
});

// Add custom milestone/event to employee journey
router.post('/', validateBody(CreateJourneyEventSchema), async (req, res) => {
  try {
    const orgId = req.organizationId!;
    const actorId = req.user!.userId;
    const actorName = req.user!.email;

    const event = await JourneyService.emitEvent({
      ...req.body,
      organizationId: orgId,
      actorId,
      actorName,
    });

    await logAuditEvent(req, {
      action: 'JOURNEY_MILESTONE_ADDED',
      resource: 'JourneyEvent',
      resourceId: event.id,
      newValue: { title: event.title, stage: event.stage },
    });

    return sendSuccess(res, event, 'Journey event recorded', 201);
  } catch (err: any) {
    return sendError(res, 'CREATE_FAILED', err.message, 400);
  }
});

export const journeyRoutes = router;
