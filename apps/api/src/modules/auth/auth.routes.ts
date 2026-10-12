import { Router } from 'express';
import { AuthService } from './auth.service.js';
import { validateBody } from '../../middleware/validate.js';
import { RegisterSchema, RegisterUserSchema, LoginSchema, RefreshTokenSchema } from '@ejc/validation';
import { sendSuccess, sendError } from '../../utils/response.js';
import { authenticate } from '../../middleware/auth.js';
import { prisma } from '../../database/prisma.js';

const router = Router();

router.post('/register', validateBody(RegisterSchema), async (req, res) => {
  try {
    const result = await AuthService.register(req.body);
    return sendSuccess(res, result, 'Registration successful', 201);
  } catch (err: any) {
    return sendError(res, 'REGISTRATION_FAILED', err.message, 400);
  }
});

router.post('/register-user', validateBody(RegisterUserSchema), async (req, res) => {
  try {
    const result = await AuthService.registerUser(req.body);
    return sendSuccess(res, result, 'User registration successful', 201);
  } catch (err: any) {
    return sendError(res, 'REGISTRATION_FAILED', err.message, 400);
  }
});

router.post('/login', validateBody(LoginSchema), async (req, res) => {
  try {
    const { email, password, organizationSlug } = req.body;
    const result = await AuthService.login(email, password, organizationSlug);
    return sendSuccess(res, result, 'Login successful');
  } catch (err: any) {
    return sendError(res, 'LOGIN_FAILED', err.message, 401);
  }
});

router.post('/refresh', validateBody(RefreshTokenSchema), async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await AuthService.refresh(refreshToken);
    return sendSuccess(res, tokens, 'Tokens refreshed');
  } catch (err: any) {
    return sendError(res, 'TOKEN_REFRESH_FAILED', err.message, 401);
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        organization: true,
        employee: {
          include: {
            department: true,
            team: true,
          },
        },
      },
    });

    if (!user) {
      return sendError(res, 'NOT_FOUND', 'User not found', 404);
    }

    return sendSuccess(res, {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organization.name,
      employee: user.employee,
    });
  } catch (err: any) {
    return sendError(res, 'FETCH_FAILED', err.message, 500);
  }
});

export const authRoutes = router;
