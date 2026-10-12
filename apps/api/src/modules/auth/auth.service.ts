import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../database/prisma.js';
import { config } from '../../config/index.js';
import { JwtPayload, UserRoleType } from '@ejc/types';
import { JourneyService } from '../journey/journey.service.js';

export interface RegisterInput {
  email: string;
  password: string;
  organizationName: string;
  firstName: string;
  lastName: string;
  role?: UserRoleType;
}

export interface RegisterUserInput {
  email: string;
  password: string;
  organizationSlug: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
}

export class AuthService {
  static async register(input: RegisterInput) {
    const slug = input.organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: input.email },
    });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Check or create organization
    let organization = await prisma.organization.findUnique({
      where: { slug },
    });

    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: input.organizationName,
          slug,
        },
      });

      // Seed default onboarding template
      await prisma.onboardingTemplate.create({
        data: {
          organizationId: organization.id,
          title: 'Standard Employee Onboarding',
          isDefault: true,
          tasks: {
            create: [
              { title: 'Submit Identity & Tax Documents', description: 'Upload government photo ID and tax forms', dueDayOffset: 3, assignedRole: 'EMPLOYEE' },
              { title: 'Acknowledge Employee Handbook & Code of Conduct', description: 'Review and electronically sign company policies', dueDayOffset: 5, assignedRole: 'EMPLOYEE' },
              { title: 'Team Introduction & Buddy Sync', description: 'Meet with your designated onboarding buddy and team leads', dueDayOffset: 7, assignedRole: 'EMPLOYEE' },
              { title: 'Setup Development Environment & Security MFA', description: 'Configure laptop, 2FA, password manager, and workspace credentials', dueDayOffset: 2, assignedRole: 'EMPLOYEE' },
              { title: 'Define 30-60-90 Day Success Goals', description: 'Align with manager on performance expectations and probation targets', dueDayOffset: 14, assignedRole: 'EMPLOYEE' },
            ],
          },
        },
      });
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const assignedRole = input.role || 'ORG_ADMIN';

    // Create User & Employee profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          organizationId: organization.id,
          email: input.email,
          passwordHash,
          role: assignedRole as any,
        },
      });

      const employeeCode = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          employeeCode,
          firstName: input.firstName,
          lastName: input.lastName,
          jobTitle: assignedRole === 'ORG_ADMIN' ? 'Head of Operations / Admin' : 'Senior Specialist',
          status: 'ACTIVE',
          currentLevel: 'L4',
        },
      });

      return { user, employee };
    });

    // Emit Journey milestone
    await JourneyService.emitEvent({
      organizationId: organization.id,
      employeeId: result.employee.id,
      stage: 'JOINED',
      category: 'LIFECYCLE',
      title: 'Joined Organization',
      description: `Officially joined ${organization.name} as ${result.employee.jobTitle}`,
      actorId: result.user.id,
      actorName: `${result.employee.firstName} ${result.employee.lastName}`,
    });

    const tokens = this.generateTokens({
      userId: result.user.id,
      email: result.user.email,
      organizationId: organization.id,
      role: assignedRole,
      employeeId: result.employee.id,
    });

    await prisma.user.update({
      where: { id: result.user.id },
      data: { refreshToken: tokens.refreshToken, lastLoginAt: new Date() },
    });

    return {
      tokens,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        organizationId: organization.id,
        organizationName: organization.name,
        organizationStatus: organization.status,
        employee: {
          id: result.employee.id,
          employeeCode: result.employee.employeeCode,
          firstName: result.employee.firstName,
          lastName: result.employee.lastName,
          jobTitle: result.employee.jobTitle,
          isOnboardingCompleted: result.employee.isOnboardingCompleted,
          onboardingStep: result.employee.onboardingStep,
        },
      },
    };
  }

  /**
   * Register a user into an existing organization.
   * Public users are strictly assigned EMPLOYEE role to prevent privilege escalation.
   */
  static async registerUser(input: RegisterUserInput) {
    const orgSlug = input.organizationSlug.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');

    const organization = await prisma.organization.findUnique({
      where: { slug: orgSlug },
    });

    if (!organization) {
      throw new Error(`Organization with code '${input.organizationSlug}' does not exist. Please contact your organization administrator or create a new organization.`);
    }

    if (organization.status !== 'ACTIVE') {
      throw new Error(`Organization is currently ${organization.status.toLowerCase().replace('_', ' ')}. Please contact your administrator.`);
    }

    // Check duplicate email
    const existingUser = await prisma.user.findFirst({
      where: { email: input.email },
    });
    if (existingUser) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    // Explicitly enforce base role for self-registration: EMPLOYEE
    const assignedRole: UserRoleType = 'EMPLOYEE';

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          organizationId: organization.id,
          email: input.email,
          passwordHash,
          role: assignedRole,
        },
      });

      const employeeCode = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          employeeCode,
          firstName: input.firstName,
          lastName: input.lastName,
          jobTitle: input.jobTitle || 'Team Member',
          status: 'PROBATION',
          currentLevel: 'L1',
          isOnboardingCompleted: false,
          onboardingStep: 1,
        },
      });

      // Assign default onboarding tasks if template exists
      const defaultTemplate = await tx.onboardingTemplate.findFirst({
        where: { organizationId: organization.id, isDefault: true },
        include: { tasks: true },
      });

      if (defaultTemplate && defaultTemplate.tasks.length > 0) {
        for (const task of defaultTemplate.tasks) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + task.dueDayOffset);
          await tx.employeeOnboardingTask.create({
            data: {
              employeeId: employee.id,
              taskId: task.id,
              dueDate,
              status: 'PENDING',
            },
          });
        }
      }

      return { user, employee };
    });

    // Emit Journey milestone
    await JourneyService.emitEvent({
      organizationId: organization.id,
      employeeId: result.employee.id,
      stage: 'JOINED',
      category: 'LIFECYCLE',
      title: 'Joined Organization',
      description: `Officially joined ${organization.name} as ${result.employee.jobTitle}`,
      actorId: result.user.id,
      actorName: `${result.employee.firstName} ${result.employee.lastName}`,
    });

    const tokens = this.generateTokens({
      userId: result.user.id,
      email: result.user.email,
      organizationId: organization.id,
      role: assignedRole,
      employeeId: result.employee.id,
    });

    await prisma.user.update({
      where: { id: result.user.id },
      data: { refreshToken: tokens.refreshToken, lastLoginAt: new Date() },
    });

    return {
      tokens,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        organizationId: organization.id,
        organizationName: organization.name,
        organizationStatus: organization.status,
        employee: {
          id: result.employee.id,
          employeeCode: result.employee.employeeCode,
          firstName: result.employee.firstName,
          lastName: result.employee.lastName,
          jobTitle: result.employee.jobTitle,
          isOnboardingCompleted: false,
          onboardingStep: 1,
        },
      },
    };
  }

  static async login(email: string, password: string, organizationSlug?: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedSlug = organizationSlug?.trim().toLowerCase();
    
const user = await prisma.user.findFirst({
  where: {
    email: normalizedEmail,
    isActive: true,
    ...(normalizedSlug
      ? {
          organization: {
            slug: normalizedSlug.replace(/[^a-z0-9]/g, '-'),
          },
        }
      : {}),
  },
  include: {
    organization: true,
    employee: true,
  },
});


    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.organization.status !== 'ACTIVE') {
      throw new Error(`Organization is ${user.organization.status.toLowerCase().replace('_', ' ')}. Please contact your administrator.`);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role as UserRoleType,
      employeeId: user.employee?.id,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken, lastLoginAt: new Date() },
    });

    return {
      tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organization.name,
        organizationStatus: user.organization.status,
        employee: user.employee
          ? {
              id: user.employee.id,
              employeeCode: user.employee.employeeCode,
              firstName: user.employee.firstName,
              lastName: user.employee.lastName,
              jobTitle: user.employee.jobTitle,
              avatarUrl: user.employee.avatarUrl,
              isOnboardingCompleted: user.employee.isOnboardingCompleted,
              onboardingStep: user.employee.onboardingStep,
            }
          : null,
      },
    };
  }

  static async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { employee: true },
      });

      if (!user || user.refreshToken !== refreshToken || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        organizationId: user.organizationId,
        role: user.role as UserRoleType,
        employeeId: user.employee?.id,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return tokens;
    } catch (err) {
      throw new Error('Refresh token expired or invalid');
    }
  }

  static generateTokens(payload: JwtPayload) {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });
    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as any,
    });
    return { accessToken, refreshToken };
  }
}
