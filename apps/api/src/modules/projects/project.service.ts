import { prisma } from '../../database/prisma.js';

export class ProjectService {
  static async listProjects(organizationId: string) {
    return prisma.project.findMany({
      where: { organizationId },
      include: {
        members: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                jobTitle: true,
                avatarUrl: true,
                department: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getProject(projectId: string, organizationId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId },
      include: {
        members: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                jobTitle: true,
                avatarUrl: true,
                department: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  }

  static async createProject(
    organizationId: string,
    data: {
      name: string;
      code?: string;
      description?: string;
      status?: string;
      startDate?: string;
      targetEndDate?: string;
      memberIds?: string[];
    }
  ) {
    const project = await prisma.project.create({
      data: {
        organizationId,
        name: data.name,
        code: data.code,
        description: data.description,
        status: data.status || 'PLANNING',
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        targetEndDate: data.targetEndDate ? new Date(data.targetEndDate) : undefined,
      },
    });

    if (data.memberIds && data.memberIds.length > 0) {
      await prisma.projectMember.createMany({
        data: data.memberIds.map((empId) => ({
          projectId: project.id,
          employeeId: empId,
          role: 'CONTRIBUTOR',
        })),
        skipDuplicates: true,
      });
    }

    return this.getProject(project.id, organizationId);
  }

  static async updateProject(
    projectId: string,
    organizationId: string,
    data: {
      name?: string;
      code?: string;
      description?: string;
      status?: string;
      startDate?: string;
      targetEndDate?: string;
    }
  ) {
    await prisma.project.updateMany({
      where: { id: projectId, organizationId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.code ? { code: data.code } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
        ...(data.targetEndDate ? { targetEndDate: new Date(data.targetEndDate) } : {}),
      },
    });

    return this.getProject(projectId, organizationId);
  }

  static async addMember(projectId: string, employeeId: string, role: string = 'CONTRIBUTOR') {
    return prisma.projectMember.upsert({
      where: {
        projectId_employeeId: { projectId, employeeId },
      },
      create: {
        projectId,
        employeeId,
        role,
      },
      update: {
        role,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  static async removeMember(projectId: string, employeeId: string) {
    return prisma.projectMember.deleteMany({
      where: {
        projectId,
        employeeId,
      },
    });
  }

  static async deleteProject(projectId: string, organizationId: string) {
    return prisma.project.deleteMany({
      where: { id: projectId, organizationId },
    });
  }
}
