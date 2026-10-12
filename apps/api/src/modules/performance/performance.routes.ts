import { Router } from 'express';
import { PerformanceService } from './performance.service.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenant } from '../../middleware/tenant.js';
import { validateBody } from '../../middleware/validate.js';
import { CreateGoalSchema, UpdateGoalProgressSchema, SubmitReviewSchema } from '@ejc/validation';
import { sendSuccess, sendError } from '../../utils/response.js';
import { prisma } from '../../database/prisma.js';
import { z } from 'zod';

const router = Router();
router.use(authenticate, enforceTenant);

// List goals for an employee
router.get('/goals/employee/:employeeId', async (req, res) => {
  try {
    const targetEmployeeId = req.params.employeeId;
    const currentEmployeeId = req.user!.employeeId;
    const userRole = req.user!.role;
    const orgId = req.organizationId!;

    // RBAC: Employee can only view their own goals
    if (userRole === 'EMPLOYEE' && targetEmployeeId !== currentEmployeeId) {
      return sendError(res, 'FORBIDDEN', 'Employees can only view their own goals', 403);
    }

    // RBAC: Manager can only view their own goals or direct reports
    if (userRole === 'MANAGER' && targetEmployeeId !== currentEmployeeId) {
      const isDirectReport = await prisma.employee.findFirst({
        where: { id: targetEmployeeId, managerId: currentEmployeeId, organizationId: orgId },
      });
      if (!isDirectReport) {
        return sendError(res, 'FORBIDDEN', 'Managers can only view goals for team direct reports', 403);
      }
    }

    const goals = await prisma.goal.findMany({
      where: {
        employeeId: targetEmployeeId,
        organizationId: orgId,
      },
      include: { keyResults: true },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, goals);
  } catch (err: any) {
    return sendError(res, 'FETCH_FAILED', err.message, 500);
  }
});

// Create goal
router.post('/goals', validateBody(CreateGoalSchema), async (req, res) => {
  try {
    const orgId = req.organizationId!;
    const actorId = req.user!.userId;
    const actorName = req.user!.email;

    const goal = await PerformanceService.createGoal(
      {
        ...req.body,
        organizationId: orgId,
        startDate: new Date(req.body.startDate),
        dueDate: new Date(req.body.dueDate),
      },
      actorId,
      actorName
    );

    return sendSuccess(res, goal, 'Goal created', 201);
  } catch (err: any) {
    return sendError(res, 'CREATE_FAILED', err.message, 400);
  }
});

// Update goal progress
router.patch('/goals/:goalId', validateBody(UpdateGoalProgressSchema), async (req, res) => {
  try {
    const { progressPercent = 0, status } = req.body;
    const actorId = req.user!.userId;
    const actorName = req.user!.email;

    const updated = await PerformanceService.updateGoalProgress(
      req.params.goalId,
      req.organizationId!,
      progressPercent,
      status,
      actorId,
      actorName
    );

    return sendSuccess(res, updated, 'Goal updated');
  } catch (err: any) {
    return sendError(res, 'UPDATE_FAILED', err.message, 400);
  }
});

// Get active review cycle
router.get('/cycles', async (req, res) => {
  try {
    const cycle = await PerformanceService.getOrCreateDefaultCycle(req.organizationId!);
    return sendSuccess(res, cycle);
  } catch (err: any) {
    return sendError(res, 'FETCH_FAILED', err.message, 500);
  }
});

// List reviews
router.get('/reviews', async (req, res) => {
  try {
    const employeeId = req.query.employeeId as string | undefined;
    const reviews = await PerformanceService.getReviews(req.organizationId!, employeeId);
    return sendSuccess(res, reviews);
  } catch (err: any) {
    return sendError(res, 'FETCH_FAILED', err.message, 500);
  }
});

// Submit performance review
router.post('/reviews', validateBody(SubmitReviewSchema), async (req, res) => {
  try {
    const orgId = req.organizationId!;
    const actorId = req.user!.userId;
    const actorName = req.user!.email;

    const review = await PerformanceService.submitReview(
      {
        ...req.body,
        managerId: req.user?.employeeId,
      },
      orgId,
      actorId,
      actorName
    );

    return sendSuccess(res, review, 'Review submitted successfully');
  } catch (err: any) {
    return sendError(res, 'SUBMIT_FAILED', err.message, 400);
  }
});

// Give recognition
const RecognitionSchema = z.object({
  recipientId: z.string().uuid(),
  badgeTitle: z.string().min(2),
  message: z.string().min(2),
});

router.post('/recognition', validateBody(RecognitionSchema), async (req, res) => {
  try {
    const orgId = req.organizationId!;
    const authorId = req.user?.employeeId;
    if (!authorId) {
      return sendError(res, 'FORBIDDEN', 'Only employees can give peer recognition', 403);
    }

    const result = await PerformanceService.giveRecognition(
      {
        organizationId: orgId,
        recipientId: req.body.recipientId,
        authorId,
        badgeTitle: req.body.badgeTitle,
        message: req.body.message,
      },
      req.user!.email
    );

    return sendSuccess(res, result, 'Recognition awarded', 201);
  } catch (err: any) {
    return sendError(res, 'AWARD_FAILED', err.message, 400);
  }
});

export const performanceRoutes = router;
