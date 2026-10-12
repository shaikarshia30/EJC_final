import { prisma } from '../../database/prisma.js';
import { logger } from '../../utils/logger.js';
import { JourneyStage, JourneyEventCategory } from '@ejc/types';

export interface EmitJourneyEventInput {
  organizationId: string;
  employeeId: string;
  stage: JourneyStage;
  category: JourneyEventCategory;
  title: string;
  description: string;
  iconName?: string;
  actorId?: string;
  actorName?: string;
  relatedModule?: string;
  relatedEntityId?: string;
  metadata?: Record<string, any>;
  occurredAt?: Date;
}

export class JourneyService {
  /**
   * Records a lifecycle/journey event and triggers related updates
   */
  static async emitEvent(input: EmitJourneyEventInput) {
    try {
      const event = await prisma.journeyEvent.create({
        data: {
          organizationId: input.organizationId,
          employeeId: input.employeeId,
          stage: input.stage,
          category: input.category,
          title: input.title,
          description: input.description,
          iconName: input.iconName || 'Milestone',
          actorId: input.actorId,
          actorName: input.actorName,
          relatedModule: input.relatedModule,
          relatedEntityId: input.relatedEntityId,
          metadata: input.metadata ? (input.metadata as any) : {},
          occurredAt: input.occurredAt || new Date(),
        },
      });

      logger.info('Journey Event emitted', {
        employeeId: input.employeeId,
        stage: input.stage,
        category: input.category,
        title: input.title,
      });

      return event;
    } catch (err) {
      logger.error('Failed to emit journey event', { err, input });
      throw err;
    }
  }

  /**
   * Retrieves the complete chronological timeline for an employee
   */
  static async getTimeline(employeeId: string, organizationId: string) {
    return prisma.journeyEvent.findMany({
      where: {
        employeeId,
        organizationId,
      },
      orderBy: {
        occurredAt: 'asc',
      },
    });
  }

  /**
   * Calculates journey stage progression and milestone statistics
   */
  static async getJourneyStats(employeeId: string, organizationId: string) {
    const events = await this.getTimeline(employeeId, organizationId);
    
    // Ordered lifecycle sequence
    const stageSequence: JourneyStage[] = [
      'RECRUITMENT',
      'JOINED',
      'ONBOARDING',
      'PROBATION',
      'ACTIVE_DEVELOPMENT',
      'MID_REVIEW',
      'PROMOTION',
      'TRANSFER',
      'LEADERSHIP',
    ];

    const completedStages = new Set(events.map((e) => e.stage));
    const currentStageIndex = stageSequence.reduce((highest, stage, idx) => {
      return completedStages.has(stage) ? idx : highest;
    }, 0);

    const currentStage = stageSequence[currentStageIndex];
    const nextStage = currentStageIndex < stageSequence.length - 1 ? stageSequence[currentStageIndex + 1] : null;

    return {
      totalMilestones: events.length,
      currentStage,
      nextStage,
      completionPercentage: Math.round(((currentStageIndex + 1) / stageSequence.length) * 100),
      recentEvents: events.slice(-5).reverse(),
    };
  }

  /**
   * Helper to verify manager relationship
   */
  static async isManagerOf(managerEmployeeId: string, targetEmployeeId: string, organizationId: string): Promise<boolean> {
    const target = await prisma.employee.findFirst({
      where: { id: targetEmployeeId, organizationId },
      select: { managerId: true },
    });
    return target?.managerId === managerEmployeeId;
  }
}
