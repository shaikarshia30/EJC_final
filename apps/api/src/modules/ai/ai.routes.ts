import { Router } from 'express';
import { AIService } from './ai.service.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenant } from '../../middleware/tenant.js';
import { validateBody } from '../../middleware/validate.js';
import { AIChatQuerySchema } from '@ejc/validation';
import { sendSuccess, sendError } from '../../utils/response.js';

const router = Router();
router.use(authenticate, enforceTenant);

// Post message to AI Assistant
router.post('/chat', validateBody(AIChatQuerySchema), async (req, res) => {
  try {
    const { message } = req.body;
    const response = await AIService.processMessage(message, {
      userId: req.user!.userId,
      employeeId: req.user!.employeeId,
      organizationId: req.organizationId!,
      userRole: req.user!.role,
    });

    return sendSuccess(res, response);
  } catch (err: any) {
    return sendError(res, 'AI_ERROR', err.message, 500);
  }
});

export const aiRoutes = router;
