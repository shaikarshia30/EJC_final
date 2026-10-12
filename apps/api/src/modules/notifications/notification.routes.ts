import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenant } from '../../middleware/tenant.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { prisma } from '../../database/prisma.js';

const router = Router();
router.use(authenticate, enforceTenant);

// Get user/employee notifications
router.get('/', async (req, res) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return sendSuccess(res, []);
    }

    const notifications = await prisma.notification.findMany({
      where: {
        employeeId,
        organizationId: req.organizationId!,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return sendSuccess(res, notifications);
  } catch (err: any) {
    return sendError(res, 'FETCH_FAILED', err.message, 500);
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    return sendSuccess(res, updated, 'Notification marked as read');
  } catch (err: any) {
    return sendError(res, 'UPDATE_FAILED', err.message, 400);
  }
});

export const notificationRoutes = router;
