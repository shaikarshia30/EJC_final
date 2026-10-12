import { Router } from 'express';
import { EmployeeService } from './employee.service.js';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenant } from '../../middleware/tenant.js';
import { requireRole } from '../../middleware/rbac.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import { CreateEmployeeSchema } from '@ejc/validation';
import { sendSuccess, sendError } from '../../utils/response.js';
import { logAuditEvent } from '../../middleware/audit.js';
import { z } from 'zod';

const router = Router();

// Apply auth and tenant enforcement to all employee routes
router.use(authenticate, enforceTenant);

const EmployeeQuerySchema = z.object({
  search: z.string().optional(),
  departmentId: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
});

// List employees (HR/Admins see all; Managers see direct reports; Employees restricted)
router.get('/', validateQuery(EmployeeQuerySchema), async (req, res) => {
  try {
    const orgId = req.organizationId!;
    const userRole = req.user!.role;
    const employeeId = req.user!.employeeId;

    let managerFilterId: string | undefined;
    if (userRole === 'MANAGER') {
      managerFilterId = employeeId;
    } else if (userRole === 'EMPLOYEE') {
      // Employees cannot query entire workforce list; only allowed to see themselves or directory overview
      return sendError(res, 'FORBIDDEN', 'Employees are not authorized to view the workforce roster', 403);
    }

    const result = await EmployeeService.listEmployees(orgId, {
      ...(req.query as any),
      managerId: managerFilterId,
    });
    return sendSuccess(res, result);
  } catch (err: any) {
    return sendError(res, 'FETCH_FAILED', err.message, 500);
  }
});

// Get Employee 360 profile
router.get('/:id', async (req, res) => {
  try {
    const orgId = req.organizationId!;
    const userRole = req.user!.role;
    const currentEmployeeId = req.user!.employeeId;
    const targetEmployeeId = req.params.id;

    // RBAC: An employee can only view their own 360 profile
    if (userRole === 'EMPLOYEE' && targetEmployeeId !== currentEmployeeId) {
      return sendError(res, 'FORBIDDEN', 'You are only authorized to view your own Employee 360 profile', 403);
    }

    // RBAC: A manager can only view themselves or their direct reports
    if (userRole === 'MANAGER' && targetEmployeeId !== currentEmployeeId) {
      const isDirectReport = await EmployeeService.isManagerOf(currentEmployeeId!, targetEmployeeId, orgId);
      if (!isDirectReport) {
        return sendError(res, 'FORBIDDEN', 'Managers can only view direct reports in their assigned team', 403);
      }
    }

    const profile = await EmployeeService.getEmployee360(targetEmployeeId, orgId);
    return sendSuccess(res, profile);
  } catch (err: any) {
    return sendError(res, 'NOT_FOUND', err.message, 404);
  }
});

// Create new employee (HR Admin or HR Manager)
router.post(
  '/',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER']),
  validateBody(CreateEmployeeSchema),
  async (req, res) => {
    try {
      const orgId = req.organizationId!;
      const actorId = req.user!.userId;
      const actorName = req.user!.email;

      const employee = await EmployeeService.createEmployee(
        { ...req.body, organizationId: orgId },
        actorId,
        actorName
      );

      await logAuditEvent(req, {
        action: 'EMPLOYEE_CREATED',
        resource: 'Employee',
        resourceId: employee.id,
        newValue: {
          employeeCode: employee.employeeCode,
          name: `${employee.firstName} ${employee.lastName}`,
          jobTitle: employee.jobTitle,
        },
      });

      return sendSuccess(res, employee, 'Employee created successfully', 201);
    } catch (err: any) {
      return sendError(res, 'CREATE_FAILED', err.message, 400);
    }
  }
);

export const employeeRoutes = router;
