import { prisma } from '../../database/prisma.js';
import { JourneyService } from '../journey/journey.service.js';

export class CareerService {
  /**
   * Get career path and promotion readiness evaluation for an employee
   */
  static async getCareerReadiness(employeeId: string, organizationId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
      include: {
        skills: { include: { skill: true } },
        goals: true,
        reviews: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    // Determine next target role based on current title & level
    const currentLevelNum = parseInt(employee.currentLevel?.replace(/\D/g, '') || '1', 10);
    const nextLevelNum = currentLevelNum + 1;
    const targetRole = `Senior ${employee.jobTitle.replace(/^Senior\s+/, '')} (L${nextLevelNum})`;

    // Check readiness criteria
    const totalGoals = employee.goals.length;
    const completedGoals = employee.goals.filter((g) => g.status === 'COMPLETED').length;
    const goalScore = totalGoals > 0 ? (completedGoals / totalGoals) * 35 : 20;

    const verifiedSkills = employee.skills.filter((s) => s.isVerified).length;
    const skillScore = Math.min(35, verifiedSkills * 12);

    const latestReview = employee.reviews[0];
    const reviewScore = latestReview?.rating ? (latestReview.rating / 5) * 30 : 20;

    const readinessScore = Math.min(100, Math.round(goalScore + skillScore + reviewScore));

    return {
      employeeId,
      currentRole: employee.jobTitle,
      currentLevel: employee.currentLevel || 'L1',
      targetRole,
      targetLevel: `L${nextLevelNum}`,
      readinessScore,
      isPromotionReady: readinessScore >= 80,
      factors: [
        {
          name: 'Performance Review Rating',
          weight: '30%',
          status: latestReview ? `${latestReview.rating}/5.0` : 'Pending review',
          met: latestReview ? (latestReview.rating || 0) >= 4.0 : false,
        },
        {
          name: 'Verified Skill Competencies',
          weight: '35%',
          status: `${verifiedSkills} verified skills`,
          met: verifiedSkills >= 2,
        },
        {
          name: 'Goal Delivery Execution',
          weight: '35%',
          status: `${completedGoals}/${totalGoals} completed`,
          met: totalGoals > 0 && completedGoals / totalGoals >= 0.7,
        },
      ],
      recommendations: [
        'Close identified skill gaps through recommended learning modules.',
        'Complete scheduled 1-on-1 performance review cycle with manager.',
        'Demonstrate cross-functional leadership in team initiatives.',
      ],
    };
  }

  /**
   * Execute promotion and emit Journey milestone
   */
  static async promoteEmployee(
    employeeId: string,
    organizationId: string,
    newTitle: string,
    newLevel: string,
    actorId?: string,
    actorName?: string
  ) {
    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        jobTitle: newTitle,
        currentLevel: newLevel,
      },
    });

    // Automatically emit Journey Milestone!
    await JourneyService.emitEvent({
      organizationId,
      employeeId,
      stage: 'PROMOTION',
      category: 'CAREER',
      title: `Promoted to ${newTitle} (${newLevel})`,
      description: `Formal promotion awarded based on exceptional performance and validated competencies`,
      actorId,
      actorName,
      relatedModule: 'career',
      metadata: { newTitle, newLevel },
    });

    return updated;
  }
}
