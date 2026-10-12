import { prisma } from '../../database/prisma.js';
import { JourneyService } from '../journey/journey.service.js';
import { TaskStatus } from '@ejc/types';

export class OnboardingService {
  /**
   * Get employee onboarding tasks and calculate completion percentage
   */
  static async getEmployeeOnboarding(employeeId: string, organizationId: string) {
    const tasks = await prisma.employeeOnboardingTask.findMany({
      where: {
        employeeId,
        employee: { organizationId },
      },
      include: {
        task: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

    return {
      employeeId,
      totalTasks,
      completedTasks,
      overallProgress,
      isCompleted: totalTasks > 0 && completedTasks === totalTasks,
      tasks: tasks.map((t) => ({
        id: t.id,
        taskId: t.taskId,
        title: t.task.title,
        description: t.task.description,
        category: t.task.category,
        dueDayOffset: t.task.dueDayOffset,
        assignedRole: t.task.assignedRole,
        status: t.status,
        dueDate: t.dueDate,
        completedAt: t.completedAt,
        notes: t.notes,
      })),
    };
  }

  /**
   * Update an onboarding task status and emit milestone if all completed
   */
  static async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    notes?: string,
    actorId?: string,
    actorName?: string
  ) {
    const taskRecord = await prisma.employeeOnboardingTask.findUnique({
      where: { id: taskId },
      include: {
        task: true,
        employee: true,
      },
    });

    if (!taskRecord) {
      throw new Error('Onboarding task not found');
    }

    const updated = await prisma.employeeOnboardingTask.update({
      where: { id: taskId },
      data: {
        status: status as any,
        completedAt: status === 'COMPLETED' ? new Date() : null,
        notes: notes || taskRecord.notes,
      },
      include: { task: true },
    });

    // Check if all tasks for this employee are now complete
    const remainingIncomplete = await prisma.employeeOnboardingTask.count({
      where: {
        employeeId: taskRecord.employeeId,
        status: { not: 'COMPLETED' },
      },
    });

    if (remainingIncomplete === 0) {
      // Automatically emit onboarding completed journey milestone!
      await JourneyService.emitEvent({
        organizationId: taskRecord.employee.organizationId,
        employeeId: taskRecord.employeeId,
        stage: 'PROBATION',
        category: 'ONBOARDING',
        title: 'Completed Onboarding Program',
        description: 'Successfully finished all company and team onboarding tasks and verifications',
        actorId,
        actorName,
        relatedModule: 'onboarding',
        relatedEntityId: taskId,
      });

      // Update employee status to ACTIVE if still in probation or mark probation on-track
      await prisma.employee.update({
        where: { id: taskRecord.employeeId },
        data: { currentLevel: 'L2' },
      });
    }

    return updated;
  }

  /**
   * Get or create templates for organization
   */
  static async getTemplates(organizationId: string) {
    return prisma.onboardingTemplate.findMany({
      where: { organizationId },
      include: { tasks: true },
    });
  }

  /**
   * Get wizard state for employee, ensuring default tasks are initialized
   */
  static async getWizard(employeeId: string, organizationId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
      include: {
        department: true,
        skills: { include: { skill: true } },
      },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    // Check if tasks exist; if not, seed from default template
    let tasks = await prisma.employeeOnboardingTask.findMany({
      where: { employeeId },
      include: { task: true },
      orderBy: { dueDate: 'asc' },
    });

    if (tasks.length === 0) {
      const defaultTemplate = await prisma.onboardingTemplate.findFirst({
        where: { organizationId, isDefault: true },
        include: { tasks: true },
      });

      if (defaultTemplate && defaultTemplate.tasks.length > 0) {
        const now = new Date();
        for (const t of defaultTemplate.tasks) {
          const dueDate = new Date(now.getTime() + t.dueDayOffset * 24 * 60 * 60 * 1000);
          await prisma.employeeOnboardingTask.create({
            data: {
              employeeId,
              taskId: t.id,
              dueDate,
              status: 'PENDING',
            },
          });
        }

        tasks = await prisma.employeeOnboardingTask.findMany({
          where: { employeeId },
          include: { task: true },
          orderBy: { dueDate: 'asc' },
        });
      }
    }

    return {
      employeeId: employee.id,
      isOnboardingCompleted: employee.isOnboardingCompleted,
      onboardingStep: employee.onboardingStep,
      onboardingData: (employee.onboardingData as any) || {},
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        phone: employee.phone,
        address: employee.address,
        location: employee.location,
        jobTitle: employee.jobTitle,
        departmentId: employee.departmentId,
        departmentName: employee.department?.name,
        employmentType: employee.employmentType,
        emergencyContact: employee.emergencyContact,
        education: employee.education,
        workExperience: employee.workExperience,
        skills: employee.skills.map((s) => s.skill.name),
      },
      tasks: tasks.map((t) => ({
        id: t.id,
        taskId: t.taskId,
        title: t.task.title,
        description: t.task.description,
        category: t.task.category,
        status: t.status,
        dueDate: t.dueDate,
        completedAt: t.completedAt,
      })),
    };
  }

  /**
   * Save draft step in wizard
   */
  static async saveWizardStep(
    employeeId: string,
    organizationId: string,
    step: number,
    stepData: Record<string, any>
  ) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    const currentData = (employee.onboardingData as Record<string, any>) || {};
    const mergedData = { ...currentData, ...stepData };
    const nextStep = Math.max(employee.onboardingStep, step);

    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        onboardingStep: nextStep,
        onboardingData: mergedData,
      },
    });

    return {
      step: updated.onboardingStep,
      onboardingData: updated.onboardingData,
    };
  }

  /**
   * Complete final submission of wizard
   */
  static async submitWizard(
    employeeId: string,
    organizationId: string,
    payload: any,
    actorId?: string,
    actorName?: string
  ) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    // Complete selected tasks
    if (payload.completedTaskIds && Array.isArray(payload.completedTaskIds)) {
      await prisma.employeeOnboardingTask.updateMany({
        where: {
          employeeId,
          id: { in: payload.completedTaskIds },
        },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    }

    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        firstName: payload.firstName || employee.firstName,
        lastName: payload.lastName || employee.lastName,
        phone: payload.phone || employee.phone,
        address: payload.address || employee.address,
        emergencyContact: payload.emergencyContact || employee.emergencyContact,
        education: payload.education || employee.education,
        workExperience: payload.workExperience || employee.workExperience,
        jobTitle: payload.jobTitle || employee.jobTitle,
        location: payload.location || employee.location,
        employmentType: payload.employmentType || employee.employmentType,
        departmentId: payload.departmentId || employee.departmentId,
        isOnboardingCompleted: true,
        onboardingStep: 5,
        status: 'ACTIVE',
      },
    });

    // Emit Journey milestone for onboarding completion
    await JourneyService.emitEvent({
      organizationId,
      employeeId,
      stage: 'ONBOARDING',
      category: 'LIFECYCLE',
      title: 'Completed Onboarding Program',
      description: 'Successfully finished the 5-step onboarding wizard and verified profile credentials',
      actorId,
      actorName,
      relatedModule: 'onboarding',
      relatedEntityId: employeeId,
    });

    return updated;
  }
}
