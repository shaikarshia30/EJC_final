import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { employeeRoutes } from './modules/employees/employee.routes.js';
import { journeyRoutes } from './modules/journey/journey.routes.js';
import { onboardingRoutes } from './modules/onboarding/onboarding.routes.js';
import { performanceRoutes } from './modules/performance/performance.routes.js';
import { skillsRoutes } from './modules/skills/skills.routes.js';
import { learningRoutes } from './modules/learning/learning.routes.js';
import { careerRoutes } from './modules/career/career.routes.js';
import { analyticsRoutes } from './modules/analytics/analytics.routes.js';
import { aiRoutes } from './modules/ai/ai.routes.js';
import { documentRoutes } from './modules/documents/document.routes.js';
import { notificationRoutes } from './modules/notifications/notification.routes.js';
import { auditRoutes } from './modules/audit/audit.routes.js';
import { organizationRoutes } from './modules/organizations/organization.routes.js';
import { projectRoutes } from './modules/projects/project.routes.js';

export const createApp = () => {
  const app = express();

  // Security & Utility Middleware
  app.use(helmet());
  app.use(cors({ origin: config.cors.origin, credentials: true }));
  app.use(express.json());
  if (config.env !== 'test') {
    app.use(morgan('dev'));
  }

  // Liveness & Readiness Health Probes
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'healthy', version: '1.0.0', uptime: process.uptime() });
  });

  // Modular API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/journey', journeyRoutes);
  app.use('/api/onboarding', onboardingRoutes);
  app.use('/api/performance', performanceRoutes);
  app.use('/api/skills', skillsRoutes);
  app.use('/api/learning', learningRoutes);
  app.use('/api/career', careerRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api/organizations', organizationRoutes);
  app.use('/api/projects', projectRoutes);

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};
