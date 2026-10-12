import { prisma } from '../../database/prisma.js';
import { JourneyService } from '../journey/journey.service.js';
import { GoalStatus } from '@ejc/types';

export class PerformanceService {
  /**
   * Create goal with Key Results and emit Journey event
   */
  static async createGoal(
    data: {
      organizationId: string;
      employeeId: string;
      title: string;
      description?: string;
      category?: string;
      startDate: Date;
      dueDate: Date;
      keyResults?: { title: string; currentValue?: number; targetValue: number; unit?: string }[];
    },
    actorId?: string,
    actorName?: string
  ) {
    const goal = await prisma.goal.create({
      data: {
        organizationId: data.organizationId,
        employeeId: data.employeeId,
        title: data.title,
        description: data.description,
        category: data.category || 'INDIVIDUAL',
        startDate: data.startDate,
        dueDate: data.dueDate,
        keyResults: data.keyResults
          ? {
              create: data.keyResults.map((kr) => ({
                title: kr.title,
                currentValue: kr.currentValue || 0,
                targetValue: kr.targetValue,
                unit: kr.unit || '%',
                progressPercent: kr.targetValue > 0 ? Math.round(((kr.currentValue || 0) / kr.targetValue) * 100) : 0,
              })),
            }
          : undefined,
      },
      include: { keyResults: true },
    });

    await JourneyService.emitEvent({
      organizationId: data.organizationId,
      employeeId: data.employeeId,
      stage: 'ACTIVE_DEVELOPMENT',
      category: 'GOAL',
      title: `Assigned Goal: ${data.title}`,
      description: data.description || 'Target milestone goal established',
      actorId,
      actorName,
      relatedModule: 'goals',
      relatedEntityId: goal.id,
    });

    return goal;
  }

  /**
   * Update goal progress and key result values
   */
  static async updateGoalProgress(
    goalId: string,
    organizationId: string,
    progressPercent: number,
    status?: GoalStatus,
    actorId?: string,
    actorName?: string
  ) {
    const existing = await prisma.goal.findFirst({
      where: { id: goalId, organizationId },
      include: { employee: true },
    });

    if (!existing) {
      throw new Error('Goal not found');
    }

    const newStatus = progressPercent >= 100 ? 'COMPLETED' : status || existing.status;

    const updated = await prisma.goal.update({
      where: { id: goalId },
      data: {
        progressPercent,
        status: newStatus as any,
      },
      include: { keyResults: true },
    });

    // If reached 100% completion, emit Journey milestone!
    if (newStatus === 'COMPLETED' && existing.status !== 'COMPLETED') {
      await JourneyService.emitEvent({
        organizationId,
        employeeId: existing.employeeId,
        stage: 'ACTIVE_DEVELOPMENT',
        category: 'GOAL',
        title: `Completed Goal: ${existing.title}`,
        description: 'Successfully reached 100% progress on goal targets',
        actorId,
        actorName,
        relatedModule: 'goals',
        relatedEntityId: goalId,
      });
    }

    return updated;
  }

  /**
   * Submit performance review
   */
  static async submitReview(
    data: {
      cycleId: string;
      employeeId: string;
      managerId?: string;
      rating: number;
      strengths: string;
      growthAreas: string;
      feedback: string;
      status?: string;
    },
    organizationId: string,
    actorId?: string,
    actorName?: string
  ) {
    const review = await prisma.performanceReview.upsert({
      where: {
        cycleId_employeeId: {
          cycleId: data.cycleId,
          employeeId: data.employeeId,
        },
      },
      update: {
        rating: data.rating,
        managerReview: data.feedback,
        strengths: data.strengths,
        growthAreas: data.growthAreas,
        status: data.status || 'FINALIZED',
        finalizedAt: new Date(),
      },
      create: {
        cycleId: data.cycleId,
        employeeId: data.employeeId,
        managerId: data.managerId,
        rating: data.rating,
        managerReview: data.feedback,
        strengths: data.strengths,
        growthAreas: data.growthAreas,
        status: data.status || 'FINALIZED',
        finalizedAt: new Date(),
      },
      include: { cycle: true },
    });

    // Automatically emit Journey Milestone for performance review
    await JourneyService.emitEvent({
      organizationId,
      employeeId: data.employeeId,
      stage: 'MID_REVIEW',
      category: 'PERFORMANCE',
      title: `Performance Review Finalized: ${review.cycle.title}`,
      description: `Performance evaluation completed with rating ${data.rating}/5. Strengths: ${data.strengths.slice(0, 80)}...`,
      actorId,
      actorName,
      relatedModule: 'performance',
      relatedEntityId: review.id,
      metadata: { rating: data.rating },
    });

    return review;
  }

  /**
   * Send Recognition / Badge and add to employee Journey
   */
  static async giveRecognition(
    data: {
      organizationId: string;
      recipientId: string;
      authorId: string;
      badgeTitle: string;
      message: string;
    },
    authorName: string
  ) {
    const recognition = await prisma.recognition.create({
      data: {
        organizationId: data.organizationId,
        recipientId: data.recipientId,
        authorId: data.authorId,
        badgeTitle: data.badgeTitle,
        message: data.message,
      },
      include: { recipient: true },
    });

    await JourneyService.emitEvent({
      organizationId: data.organizationId,
      employeeId: data.recipientId,
      stage: 'ACTIVE_DEVELOPMENT',
      category: 'RECOGNITION',
      title: `Received Recognition: ${data.badgeTitle}`,
      description: `"${data.message}" — Recognized by ${authorName}`,
      actorId: data.authorId,
      actorName: authorName,
      relatedModule: 'recognition',
      relatedEntityId: recognition.id,
    });

    return recognition;
  }

  static async getOrCreateDefaultCycle(organizationId: string) {
    let cycle = await prisma.performanceReviewCycle.findFirst({
      where: { organizationId, isActive: true },
    });
    if (!cycle) {
      const now = new Date();
      const year = now.getFullYear();
      cycle = await prisma.performanceReviewCycle.create({
        data: {
          organizationId,
          title: `Annual Performance Review ${year}`,
          period: `${year}`,
          startDate: now,
          endDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      });
    }
    return cycle;
  }

  static async getReviews(organizationId: string, employeeId?: string) {
    return prisma.performanceReview.findMany({
      where: {
        cycle: { organizationId },
        ...(employeeId ? { employeeId } : {}),
      },
      include: {
        cycle: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            avatarUrl: true,
          },
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
