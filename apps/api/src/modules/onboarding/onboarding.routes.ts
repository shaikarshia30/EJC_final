import { Router } from 'express';
import { OnboardingService } from './onboarding.service.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenant } from '../../middleware/tenant.js';
import { validateBody } from '../../middleware/validate.js';
import { UpdateOnboardingTaskSchema } from '@ejc/validation';
import { sendSuccess, sendError } from '../../utils/response.js';

const router = Router();
router.use(authenticate, enforceTenant);

// Onboarding Wizard - Get current state
router.get('/wizard', async (req, res) => {
  try {
    const employeeId = req.user!.employeeId;
    if (!employeeId) {
      return sendError(res, 'NO_EMPLOYEE_PROFILE', 'No employee profile linked to user', 400);
    }
    const wizardState = await OnboardingService.getWizard(employeeId, req.organizationId!);
    return sendSuccess(res, wizardState);
  } catch (err: any) {
    return sendError(res, 'FETCH_FAILED', err.message, 500);
  }
});

// Onboarding Wizard - Save step draft
router.post('/wizard/save', async (req, res) => {
  try {
    const employeeId = req.user!.employeeId;
    if (!employeeId) {
      return sendError(res, 'NO_EMPLOYEE_PROFILE', 'No employee profile linked to user', 400);
    }
    const { step, data } = req.body;
    const result = await OnboardingService.saveWizardStep(
      employeeId,
      req.organizationId!,
      step || 1,
      data || {}
    );
    return sendSuccess(res, result, 'Step saved');
  } catch (err: any) {
    return sendError(res, 'SAVE_FAILED', err.message, 400);
  }
});

// Onboarding Wizard - Final submit
router.post('/wizard/submit', async (req, res) => {
  try {
    const employeeId = req.user!.employeeId;
    if (!employeeId) {
      return sendError(res, 'NO_EMPLOYEE_PROFILE', 'No employee profile linked to user', 400);
    }
    const actorId = req.user!.userId;
    const actorName = req.user!.email;

    const result = await OnboardingService.submitWizard(
      employeeId,
      req.organizationId!,
      req.body,
      actorId,
      actorName
    );
    return sendSuccess(res, result, 'Onboarding completed successfully');
  } catch (err: any) {
    return sendError(res, 'SUBMIT_FAILED', err.message, 400);
  }
});

// Get employee onboarding progress
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const orgId = req.organizationId!;
    const progress = await OnboardingService.getEmployeeOnboarding(req.params.employeeId, orgId);
    return sendSuccess(res, progress);
  } catch (err: any) {
    return sendError(res, 'FETCH_FAILED', err.message, 500);
  }
});

// Update task status
router.patch('/tasks/:taskId', validateBody(UpdateOnboardingTaskSchema), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const actorId = req.user!.userId;
    const actorName = req.user!.email;

    const updated = await OnboardingService.updateTaskStatus(
      req.params.taskId,
      status,
      notes,
      actorId,
      actorName
    );

    return sendSuccess(res, updated, 'Task status updated');
  } catch (err: any) {
    return sendError(res, 'UPDATE_FAILED', err.message, 400);
  }
});

// Get onboarding templates
router.get('/templates', async (req, res) => {
  try {
    const orgId = req.organizationId!;
    const templates = await OnboardingService.getTemplates(orgId);
    return sendSuccess(res, templates);
  } catch (err: any) {
    return sendError(res, 'FETCH_FAILED', err.message, 500);
  }
});

export const onboardingRoutes = router;
