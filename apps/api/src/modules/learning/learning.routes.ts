import { Router } from 'express';
import { LearningService } from './learning.service.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenant } from '../../middleware/tenant.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { prisma } from '../../database/prisma.js';
import { z } from 'zod';

const router = Router();
router.use(authenticate, enforceTenant);

// List available courses
router.get('/courses', async (req, res) => {
  try {
    const orgId = req.organizationId!;
    const courses = await prisma.course.findMany({
      where: { organizationId: orgId },
      include: { skill: true },
    });
    return sendSuccess(res, courses);
  } catch (err: any) {
    return sendError(res, 'FETCH_FAILED', err.message, 500);
  }
});

// Enroll in a course
const EnrollSchema = z.object({
  employeeId: z.string().uuid(),
  courseId: z.string().uuid(),
});

router.post('/enroll', async (req, res) => {
  try {
    const { employeeId, courseId } = EnrollSchema.parse(req.body);
    const enrollment = await prisma.courseEnrollment.upsert({
      where: {
        employeeId_courseId: { employeeId, courseId },
      },
      update: { status: 'IN_PROGRESS' },
      create: {
        employeeId,
        courseId,
        status: 'IN_PROGRESS',
        progress: 10,
      },
      include: { course: true },
    });
    return sendSuccess(res, enrollment, 'Enrolled successfully', 201);
  } catch (err: any) {
    return sendError(res, 'ENROLL_FAILED', err.message, 400);
  }
});

// Mark course completed
router.post('/enrollments/:id/complete', async (req, res) => {
  try {
    const orgId = req.organizationId!;
    const actorId = req.user!.userId;
    const actorName = req.user!.email;

    const result = await LearningService.completeCourse(
      req.params.id,
      orgId,
      actorId,
      actorName
    );

    return sendSuccess(res, result, 'Course completed and certification awarded');
  } catch (err: any) {
    return sendError(res, 'COMPLETE_FAILED', err.message, 400);
  }
});

export const learningRoutes = router;
