import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenant } from '../../middleware/tenant.js';
import { requireRole } from '../../middleware/rbac.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { prisma } from '../../database/prisma.js';
import { z } from 'zod';

const router = Router();

// Public check organization status by slug (unauthenticated)
router.get('/public-status/:slug', async (req, res) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { slug: req.params.slug.toLowerCase() },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        domain: true,
        logoUrl: true,
        contactEmail: true,
        createdAt: true,
      },
    });

    if (!org) {
      return sendError(res, 'NOT_FOUND', 'Organization not found', 404);
    }

    return sendSuccess(res, org);
  } catch (err: any) {
    return sendError(res, 'FETCH_FAILED', err.message, 500);
  }
});

router.use(authenticate, enforceTenant);

// Update organization details
router.patch(
  '/current',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER']),
  async (req, res) => {
    try {
      const { name, domain, logoUrl, status, contactEmail, contactPhone } = req.body;
      const updated = await prisma.organization.update({
        where: { id: req.organizationId! },
        data: {
          ...(name ? { name } : {}),
          ...(domain ? { domain } : {}),
          ...(logoUrl ? { logoUrl } : {}),
          ...(status ? { status } : {}),
          ...(contactEmail ? { contactEmail } : {}),
          ...(contactPhone ? { contactPhone } : {}),
        },
      });
      return sendSuccess(res, updated, 'Organization updated');
    } catch (err: any) {
      return sendError(res, 'UPDATE_FAILED', err.message, 400);
    }
  }
);

// Get organization details
router.get('/current', async (req, res) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.organizationId! },
      include: {
        departments: {
          include: {
            teams: true,
            _count: { select: { employees: true } },
          },
        },
      },
    });

    if (!org) {
      return sendError(res, 'NOT_FOUND', 'Organization not found', 404);
    }

    return sendSuccess(res, org);
  } catch (err: any) {
    return sendError(res, 'FETCH_FAILED', err.message, 500);
  }
});

// Create department
const DepartmentSchema = z.object({
  name: z.string().min(2),
  code: z.string().optional(),
  description: z.string().optional(),
});

router.post(
  '/departments',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER']),
  async (req, res) => {
    try {
      const data = DepartmentSchema.parse(req.body);
      const department = await prisma.department.create({
        data: {
          ...data,
          organizationId: req.organizationId!,
        },
      });
      return sendSuccess(res, department, 'Department created', 201);
    } catch (err: any) {
      return sendError(res, 'CREATE_FAILED', err.message, 400);
    }
  }
);

export const organizationRoutes = router;
