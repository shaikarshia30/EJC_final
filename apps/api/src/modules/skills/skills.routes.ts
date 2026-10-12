import { Router } from 'express';
import { SkillsService } from './skills.service.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenant } from '../../middleware/tenant.js';
import { validateBody } from '../../middleware/validate.js';
import { AssignSkillSchema } from '@ejc/validation';
import { sendSuccess, sendError } from '../../utils/response.js';
import { prisma } from '../../database/prisma.js';

const router = Router();
router.use(authenticate, enforceTenant);

// Get employee skills with automated gap analysis
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const orgId = req.organizationId!;
    const targetEmployeeId = req.params.employeeId;
    const currentEmployeeId = req.user!.employeeId;
    const userRole = req.user!.role;

    if (userRole === 'EMPLOYEE' && targetEmployeeId !== currentEmployeeId) {
      return sendError(res, 'FORBIDDEN', 'Employees can only view their own skills', 403);
    }

    if (userRole === 'MANAGER' && targetEmployeeId !== currentEmployeeId) {
      const isDirectReport = await prisma.employee.findFirst({
        where: { id: targetEmployeeId, managerId: currentEmployeeId, organizationId: orgId },
      });
      if (!isDirectReport) {
        return sendError(res, 'FORBIDDEN', 'Managers can only view skills for direct reports', 403);
      }
    }

    const skills = await SkillsService.getEmployeeSkillsWithGaps(targetEmployeeId, orgId);
    return sendSuccess(res, skills);
  } catch (err: any) {
    return sendError(res, 'FETCH_FAILED', err.message, 500);
  }
});

// List organization skills catalog
router.get('/', async (req, res) => {
  try {
    const orgId = req.organizationId!;
    const skills = await prisma.skill.findMany({
      where: { organizationId: orgId },
      orderBy: { name: 'asc' },
    });
    return sendSuccess(res, skills);
  } catch (err: any) {
    return sendError(res, 'FETCH_FAILED', err.message, 500);
  }
});

// Assign skill to employee
router.post('/assign', validateBody(AssignSkillSchema), async (req, res) => {
  try {
    const { employeeId, skillId, proficiency, targetProficiency } = req.body;
    const assignment = await prisma.employeeSkill.upsert({
      where: {
        employeeId_skillId: { employeeId, skillId },
      },
      update: {
        proficiency,
        targetProficiency,
      },
      create: {
        employeeId,
        skillId,
        proficiency,
        targetProficiency,
      },
      include: { skill: true },
    });
    return sendSuccess(res, assignment, 'Skill assigned', 201);
  } catch (err: any) {
    return sendError(res, 'ASSIGN_FAILED', err.message, 400);
  }
});

// Verify employee skill
router.post('/verify/:employeeSkillId', async (req, res) => {
  try {
    const verifierId = req.user!.userId;
    const verifierName = req.user!.email;
    const verified = await SkillsService.verifySkill(
      req.params.employeeSkillId,
      verifierId,
      verifierName
    );
    return sendSuccess(res, verified, 'Skill verified');
  } catch (err: any) {
    return sendError(res, 'VERIFY_FAILED', err.message, 400);
  }
});

export const skillsRoutes = router;
