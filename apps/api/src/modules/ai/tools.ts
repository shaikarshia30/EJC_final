import { EmployeeService } from '../employees/employee.service.js';
import { JourneyService } from '../journey/journey.service.js';
import { SkillsService } from '../skills/skills.service.js';
import { RAGService, RetrievedChunk } from './rag.service.js';
import { prisma } from '../../database/prisma.js';

export interface ToolContext {
  userId: string;
  employeeId?: string;
  organizationId: string;
  userRole: string;
}

export class AITools {
  static async executeTool(name: string, args: any, ctx: ToolContext) {
    switch (name) {
      case 'getMyProfile': {
        if (!ctx.employeeId) throw new Error('No employee record associated with user');
        return await EmployeeService.getEmployee360(ctx.employeeId, ctx.organizationId);
      }
      case 'getMyJourney': {
        if (!ctx.employeeId) throw new Error('No employee record associated with user');
        const [timeline, stats] = await Promise.all([
          JourneyService.getTimeline(ctx.employeeId, ctx.organizationId),
          JourneyService.getJourneyStats(ctx.employeeId, ctx.organizationId),
        ]);
        return { timeline, stats };
      }
      case 'getMyGoals': {
        if (!ctx.employeeId) throw new Error('No employee record associated with user');
        return await prisma.goal.findMany({
          where: { employeeId: ctx.employeeId, organizationId: ctx.organizationId },
          include: { keyResults: true },
        });
      }
      case 'getMySkills': {
        if (!ctx.employeeId) throw new Error('No employee record associated with user');
        return await SkillsService.getEmployeeSkillsWithGaps(ctx.employeeId, ctx.organizationId);
      }
      case 'searchPolicies': {
        return await RAGService.searchKnowledgeBase(
          args.query || '',
          ctx.organizationId,
          ctx.userRole,
          args.limit || 3
        );
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}
