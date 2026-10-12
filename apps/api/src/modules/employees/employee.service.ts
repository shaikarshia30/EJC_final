import { prisma } from '../../database/prisma.js';
import { JourneyService } from '../journey/journey.service.js';
import bcrypt from 'bcryptjs';

export interface CreateEmployeeInput {
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role?: string;
  jobTitle: string;
  departmentId?: string;
  teamId?: string;
  managerId?: string;
  employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'INTERN';
  location?: string;
  currentLevel?: string;
  joinedAt?: Date;
}

export class EmployeeService {
  /**
   * Retrieves the comprehensive Employee 360 profile
   */
  static async getEmployee360(employeeId: string, organizationId: string) {
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        organizationId,
      },
      include: {
        user: { select: { email: true, role: true, isActive: true } },
        department: true,
        team: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            avatarUrl: true,
          },
        },
        directReports: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            status: true,
            avatarUrl: true,
          },
        },
        skills: {
          include: { skill: true },
        },
        goals: {
          include: { keyResults: true },
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          include: { cycle: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        courseEnrollments: {
          include: { course: true },
        },
        certifications: true,
        journeyEvents: {
          orderBy: { occurredAt: 'desc' },
        },
      },
    });

    if (!employee) {
      throw new Error('Employee not found or unauthorized');
    }

    const completedCourses = employee.courseEnrollments.filter((e) => e.status === 'COMPLETED').length;
    const inProgressCourses = employee.courseEnrollments.filter((e) => e.status === 'IN_PROGRESS').length;

    return {
      id: employee.id,
      userId: employee.userId,
      organizationId: employee.organizationId,
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: `${employee.firstName} ${employee.lastName}`,
      avatarUrl: employee.avatarUrl,
      email: employee.user.email,
      jobTitle: employee.jobTitle,
      departmentId: employee.departmentId,
      departmentName: employee.department?.name,
      teamId: employee.teamId,
      teamName: employee.team?.name,
      managerId: employee.managerId,
      managerName: employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : undefined,
      manager: employee.manager,
      directReports: employee.directReports,
      location: employee.location,
      status: employee.status,
      employmentType: employee.employmentType,
      experienceYears: employee.experienceYears,
      currentLevel: employee.currentLevel,
      joinedAt: employee.joinedAt,
      probationEndDate: employee.probationEndDate,
      skills: employee.skills.map((s) => ({
        id: s.id,
        skillId: s.skillId,
        skillName: s.skill.name,
        category: s.skill.category,
        proficiency: s.proficiency,
        targetProficiency: s.targetProficiency,
        isVerified: s.isVerified,
        gapIdentified: s.gapIdentified,
      })),
      goals: employee.goals.map((g) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        category: g.category,
        status: g.status,
        progressPercent: g.progressPercent,
        startDate: g.startDate,
        dueDate: g.dueDate,
        keyResults: g.keyResults.map((kr) => ({
          id: kr.id,
          title: kr.title,
          currentValue: kr.currentValue,
          targetValue: kr.targetValue,
          unit: kr.unit,
          progressPercent: kr.progressPercent,
        })),
      })),
      recentReviews: employee.reviews.map((r) => ({
        id: r.id,
        cycleName: r.cycle.title,
        period: r.cycle.period,
        rating: r.rating,
        status: r.status,
        finalComments: r.managerReview,
      })),
      journeyMilestones: employee.journeyEvents,
      learningProgress: {
        enrolledCount: employee.courseEnrollments.length,
        completedCount: completedCourses,
        inProgressCount: inProgressCourses,
        certificationsCount: employee.certifications.length,
        enrollments: employee.courseEnrollments,
      },
    };
  }

  /**
   * Helper to verify if an employee is a manager of a target employee
   */
  static async isManagerOf(managerEmployeeId: string, targetEmployeeId: string, organizationId: string): Promise<boolean> {
    const target = await prisma.employee.findFirst({
      where: {
        id: targetEmployeeId,
        organizationId,
      },
      select: { managerId: true },
    });
    return target?.managerId === managerEmployeeId;
  }

  /**
   * List all employees with multi-tenant isolation and filtering
   */
  static async listEmployees(
    organizationId: string,
    query: {
      search?: string;
      departmentId?: string;
      status?: string;
      managerId?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
      ...(query.departmentId ? { departmentId: query.departmentId } : {}),
      ...(query.status ? { status: query.status as any } : {}),
      ...(query.managerId ? { managerId: query.managerId } : {}),
      ...(query.search
        ? {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
              { employeeCode: { contains: query.search, mode: 'insensitive' } },
              { jobTitle: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        include: {
          department: true,
          team: true,
          manager: { select: { firstName: true, lastName: true } },
          user: { select: { email: true, role: true } },
        },
        orderBy: { joinedAt: 'desc' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: items.map((emp) => ({
        id: emp.id,
        employeeCode: emp.employeeCode,
        firstName: emp.firstName,
        lastName: emp.lastName,
        fullName: `${emp.firstName} ${emp.lastName}`,
        email: emp.user.email,
        jobTitle: emp.jobTitle,
        departmentName: emp.department?.name,
        teamName: emp.team?.name,
        managerName: emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : null,
        status: emp.status,
        currentLevel: emp.currentLevel,
        avatarUrl: emp.avatarUrl,
        joinedAt: emp.joinedAt,
      })),
    };
  }

  /**
   * Create an employee with linked User account and automatic onboarding kickoff
   */
  static async createEmployee(input: CreateEmployeeInput, actorId?: string, actorName?: string) {
    const defaultPassword = input.password || 'Welcome123!';
    const passwordHash = await bcrypt.hash(defaultPassword, 12);
    const assignedRole = (input.role as any) || 'EMPLOYEE';

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          organizationId: input.organizationId,
          email: input.email,
          passwordHash,
          role: assignedRole,
        },
      });

      const employeeCode = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          organizationId: input.organizationId,
          employeeCode,
          firstName: input.firstName,
          lastName: input.lastName,
          jobTitle: input.jobTitle,
          departmentId: input.departmentId,
          teamId: input.teamId,
          managerId: input.managerId,
          employmentType: input.employmentType || 'FULL_TIME',
          location: input.location,
          currentLevel: input.currentLevel || 'L1',
          joinedAt: input.joinedAt || new Date(),
          status: 'PROBATION',
        },
      });

      // Automatically assign default onboarding tasks if template exists
      const defaultTemplate = await tx.onboardingTemplate.findFirst({
        where: { organizationId: input.organizationId, isDefault: true },
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

    // Emit Journey milestones
    await JourneyService.emitEvent({
      organizationId: input.organizationId,
      employeeId: result.employee.id,
      stage: 'JOINED',
      category: 'LIFECYCLE',
      title: 'Joined Organization',
      description: `Officially joined as ${result.employee.jobTitle}`,
      actorId,
      actorName,
    });

    await JourneyService.emitEvent({
      organizationId: input.organizationId,
      employeeId: result.employee.id,
      stage: 'ONBOARDING',
      category: 'ONBOARDING',
      title: 'Onboarding Commenced',
      description: 'Standard onboarding roadmap and verification checklist activated',
      actorId,
      actorName,
    });

    return result.employee;
  }
}
