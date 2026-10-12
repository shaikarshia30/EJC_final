import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { enforceTenant } from '../../middleware/tenant.js';
import { requireRole } from '../../middleware/rbac.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { prisma } from '../../database/prisma.js';
import { RAGService } from '../ai/rag.service.js';
import { z } from 'zod';

const router = Router();
router.use(authenticate, enforceTenant);

// List organization documents
router.get('/', async (req, res) => {
  try {
    const orgId = req.organizationId!;
    const docs = await prisma.document.findMany({
      where: { organizationId: orgId },
      include: { _count: { select: { chunks: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, docs);
  } catch (err: any) {
    return sendError(res, 'FETCH_FAILED', err.message, 500);
  }
});

// Ingest/Upload document for RAG (HR Admin only)
const IngestDocSchema = z.object({
  title: z.string().min(2),
  content: z.string().min(10),
  category: z.string().default('POLICY'),
  accessLevel: z.enum(['ALL_EMPLOYEES', 'MANAGERS_ONLY', 'HR_ONLY', 'ADMIN_ONLY']).default('ALL_EMPLOYEES'),
});

router.post(
  '/ingest',
  requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER']),
  async (req, res) => {
    try {
      const { title, content, category, accessLevel } = IngestDocSchema.parse(req.body);
      const orgId = req.organizationId!;

      const doc = await RAGService.ingestDocument(
        orgId,
        title,
        content,
        category,
        accessLevel as any
      );

      return sendSuccess(res, doc, 'Document ingested and indexed for RAG', 201);
    } catch (err: any) {
      return sendError(res, 'INGEST_FAILED', err.message, 400);
    }
  }
);

export const documentRoutes = router;
