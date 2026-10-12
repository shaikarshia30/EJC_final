import { prisma } from '../../database/prisma.js';
import { JourneyService } from '../journey/journey.service.js';
import { SkillProficiency } from '@ejc/types';

const proficiencyLevels: Record<SkillProficiency, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

export class SkillsService {
  /**
   * Get employee skills and compute gap analysis
   */
  static async getEmployeeSkillsWithGaps(employeeId: string, organizationId: string) {
    const employeeSkills = await prisma.employeeSkill.findMany({
      where: {
        employeeId,
        employee: { organizationId },
      },
      include: {
        skill: {
          include: {
            courses: true,
          },
        },
      },
    });

    const skillsWithGaps = employeeSkills.map((es) => {
      const currentLevel = proficiencyLevels[es.proficiency as SkillProficiency] || 1;
      const targetLevel = es.targetProficiency
        ? proficiencyLevels[es.targetProficiency as SkillProficiency]
        : currentLevel;
      const gap = Math.max(0, targetLevel - currentLevel);

      const recommendedCourses = es.skill.courses.filter(
        (c) => c.level === es.targetProficiency || c.targetProficiency === es.targetProficiency
      );

      return {
        id: es.id,
        skillId: es.skillId,
        skillName: es.skill.name,
        category: es.skill.category,
        proficiency: es.proficiency,
        targetProficiency: es.targetProficiency,
        isVerified: es.isVerified,
        verifiedBy: es.verifiedBy,
        verifiedAt: es.verifiedAt,
        hasGap: gap > 0,
        gapLevels: gap,
        recommendedCourses,
        reason:
          gap > 0
            ? `Recommended to advance from ${es.proficiency} to required level ${es.targetProficiency}`
            : 'Proficiency currently satisfies target expectations',
      };
    });

    return skillsWithGaps;
  }

  /**
   * Verify an employee skill and emit Journey milestone
   */
  static async verifySkill(
    employeeSkillId: string,
    verifiedBy: string,
    verifierName: string
  ) {
    const es = await prisma.employeeSkill.findUnique({
      where: { id: employeeSkillId },
      include: {
        employee: true,
        skill: true,
      },
    });

    if (!es) {
      throw new Error('Employee skill record not found');
    }

    const updated = await prisma.employeeSkill.update({
      where: { id: employeeSkillId },
      data: {
        isVerified: true,
        verifiedBy,
        verifiedAt: new Date(),
      },
    });

    // Automatically emit Journey milestone!
    await JourneyService.emitEvent({
      organizationId: es.employee.organizationId,
      employeeId: es.employeeId,
      stage: 'ACTIVE_DEVELOPMENT',
      category: 'SKILL',
      title: `Skill Verified: ${es.skill.name} (${es.proficiency})`,
      description: `Formally certified and verified by ${verifierName}`,
      actorId: verifiedBy,
      actorName: verifierName,
      relatedModule: 'skills',
      relatedEntityId: es.skillId,
      metadata: { proficiency: es.proficiency },
    });

    return updated;
  }
}
