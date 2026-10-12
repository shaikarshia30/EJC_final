import { prisma } from '../../database/prisma.js';
import { JourneyService } from '../journey/journey.service.js';

export class LearningService {
  /**
   * Complete course and emit Journey milestone & certification
   */
  static async completeCourse(
    enrollmentId: string,
    organizationId: string,
    actorId?: string,
    actorName?: string
  ) {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: true,
        employee: true,
      },
    });

    if (!enrollment) {
      throw new Error('Course enrollment not found');
    }

    const updated = await prisma.courseEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date(),
      },
    });

    // Automatically issue certification
    const cert = await prisma.certification.create({
      data: {
        employeeId: enrollment.employeeId,
        name: `Certificate of Completion: ${enrollment.course.title}`,
        issuer: enrollment.course.provider || 'EJC Academy',
        issueDate: new Date(),
        credentialId: `CERT-${Math.floor(10000 + Math.random() * 90000)}`,
      },
    });

    // Automatically emit Journey milestone!
    await JourneyService.emitEvent({
      organizationId,
      employeeId: enrollment.employeeId,
      stage: 'ACTIVE_DEVELOPMENT',
      category: 'LEARNING',
      title: `Completed Course: ${enrollment.course.title}`,
      description: `Earned certification credential ${cert.credentialId} issued by ${cert.issuer}`,
      actorId,
      actorName,
      relatedModule: 'learning',
      relatedEntityId: cert.id,
    });

    return { enrollment: updated, certification: cert };
  }
}
