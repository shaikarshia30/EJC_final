import { Router } from 'express';
import { ProjectService } from './project.service.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenant } from '../../middleware/tenant.js';
import { requireRole } from '../../middleware/rbac.js';
import { validateBody } from '../../middleware/validate.js';
import { CreateProjectSchema, UpdateProjectSchema, AddProjectMemberSchema } from '@ejc/validation';
import { sendSuccess, sendError } from '../../utils/response.js';

const router = Router();
router.use(authenticate, enforceTenant);

// List projects
router.get('/', async (req, res) => {
  try {
    const projects = await ProjectService.listProjects(req.organizationId!);
    return sendSuccess(res, projects);
  } catch (err: any) {
    return sendError(res, 'FETCH_FAILED', err.message, 500);
  }
});

// Get project details
router.get('/:projectId', async (req, res) => {
  try {
    const project = await ProjectService.getProject(req.params.projectId, req.organizationId!);
    return sendSuccess(res, project);
  } catch (err: any) {
    return sendError(res, 'NOT_FOUND', err.message, 404);
  }
});

// Create project
router.post(
  '/',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER', 'MANAGER']),
  validateBody(CreateProjectSchema),
  async (req, res) => {
    try {
      const project = await ProjectService.createProject(req.organizationId!, req.body);
      return sendSuccess(res, project, 'Project created', 201);
    } catch (err: any) {
      return sendError(res, 'CREATE_FAILED', err.message, 400);
    }
  }
);

// Update project
router.patch(
  '/:projectId',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER', 'MANAGER']),
  validateBody(UpdateProjectSchema),
  async (req, res) => {
    try {
      const updated = await ProjectService.updateProject(
        req.params.projectId,
        req.organizationId!,
        req.body
      );
      return sendSuccess(res, updated, 'Project updated');
    } catch (err: any) {
      return sendError(res, 'UPDATE_FAILED', err.message, 400);
    }
  }
);

// Add member to project
router.post(
  '/:projectId/members',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER', 'MANAGER']),
  validateBody(AddProjectMemberSchema),
  async (req, res) => {
    try {
      const { employeeId, role } = req.body;
      const member = await ProjectService.addMember(req.params.projectId, employeeId, role);
      return sendSuccess(res, member, 'Member added to project', 201);
    } catch (err: any) {
      return sendError(res, 'ADD_FAILED', err.message, 400);
    }
  }
);

// Remove member from project
router.delete(
  '/:projectId/members/:employeeId',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER', 'MANAGER']),
  async (req, res) => {
    try {
      await ProjectService.removeMember(req.params.projectId, req.params.employeeId);
      return sendSuccess(res, null, 'Member removed from project');
    } catch (err: any) {
      return sendError(res, 'REMOVE_FAILED', err.message, 400);
    }
  }
);

// Delete project
router.delete(
  '/:projectId',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER']),
  async (req, res) => {
    try {
      await ProjectService.deleteProject(req.params.projectId, req.organizationId!);
      return sendSuccess(res, null, 'Project deleted');
    } catch (err: any) {
      return sendError(res, 'DELETE_FAILED', err.message, 400);
    }
  }
);

export const projectRoutes = router;
