import { prisma } from '../../database/prisma.js';

export class AnalyticsService {
  /**
   * Analytics for HR Dashboard
   */
  static async getHRAnalytics(organizationId: string) {
    const [
      totalEmployees,
      activeEmployees,
      probationEmployees,
      totalGoals,
      completedGoals,
      onboardingTasks,
      completedOnboardingTasks,
      departments,
      recentMilestones,
    ] = await Promise.all([
      prisma.employee.count({ where: { organizationId } }),
      prisma.employee.count({ where: { organizationId, status: 'ACTIVE' } }),
      prisma.employee.count({ where: { organizationId, status: 'PROBATION' } }),
      prisma.goal.count({ where: { organizationId } }),
      prisma.goal.count({ where: { organizationId, status: 'COMPLETED' } }),
      prisma.employeeOnboardingTask.count({ where: { employee: { organizationId } } }),
      prisma.employeeOnboardingTask.count({ where: { employee: { organizationId }, status: 'COMPLETED' } }),
      prisma.department.findMany({
        where: { organizationId },
        include: { _count: { select: { employees: true } } },
      }),
      prisma.journeyEvent.findMany({
        where: { organizationId },
        orderBy: { occurredAt: 'desc' },
        take: 8,
        include: {
          employee: {
            select: { firstName: true, lastName: true, jobTitle: true, avatarUrl: true },
          },
        },
      }),
    ]);

    const onboardingRate = onboardingTasks > 0 ? Math.round((completedOnboardingTasks / onboardingTasks) * 100) : 100;
    const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    return {
      workforce: {
        totalEmployees,
        activeEmployees,
        probationEmployees,
        attritionRiskLowPercentage: 94,
      },
      onboarding: {
        totalTasks: onboardingTasks,
        completedTasks: completedOnboardingTasks,
        completionRate: onboardingRate,
      },
      performance: {
        totalGoals,
        completedGoals,
        completionRate: goalCompletionRate,
      },
      departmentDistribution: departments.map((d) => ({
        id: d.id,
        name: d.name,
        employeeCount: d._count.employees,
      })),
      recentMilestones: recentMilestones.map((m) => ({
        id: m.id,
        title: m.title,
        stage: m.stage,
        category: m.category,
        employeeName: `${m.employee.firstName} ${m.employee.lastName}`,
        jobTitle: m.employee.jobTitle,
        occurredAt: m.occurredAt,
      })),
    };
  }

  /**
   * Analytics for Manager Dashboard
   */
  static async getManagerAnalytics(managerEmployeeId: string, organizationId: string) {
    const directReports = await prisma.employee.findMany({
      where: {
        organizationId,
        managerId: managerEmployeeId,
      },
      include: {
        goals: true,
        skills: { include: { skill: true } },
        courseEnrollments: true,
      },
    });

    const totalTeamMembers = directReports.length;
    let teamGoals = 0;
    let teamGoalsCompleted = 0;
    let verifiedSkillsCount = 0;

    directReports.forEach((emp) => {
      teamGoals += emp.goals.length;
      teamGoalsCompleted += emp.goals.filter((g) => g.status === 'COMPLETED').length;
      verifiedSkillsCount += emp.skills.filter((s) => s.isVerified).length;
    });

    return {
      teamSummary: {
        totalMembers: totalTeamMembers,
        goalCompletionRate: teamGoals > 0 ? Math.round((teamGoalsCompleted / teamGoals) * 100) : 0,
        verifiedSkillsTotal: verifiedSkillsCount,
      },
      directReports: directReports.map((emp) => ({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        jobTitle: emp.jobTitle,
        status: emp.status,
        goalsTotal: emp.goals.length,
        goalsCompleted: emp.goals.filter((g) => g.status === 'COMPLETED').length,
        learningCount: emp.courseEnrollments.length,
      })),
    };
  }
}
