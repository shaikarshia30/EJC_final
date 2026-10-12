import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { RAGService, RetrievedChunk } from './rag.service.js';
import { AITools, ToolContext } from './tools.js';

export interface ChatResponse {
  content: string;
  sources?: RetrievedChunk[];
  contextPills?: string[];
  suggestedActions?: string[];
}

// In-memory rate limiting map: userId -> timestamps array
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(userId) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  validTimestamps.push(now);
  rateLimitMap.set(userId, validTimestamps);
  return true;
}

export class AIService {
  /**
   * Process employee/HR chat message using RAG, context tools, and OpenAI
   */
  static async processMessage(
    userMessage: string,
    ctx: ToolContext
  ): Promise<ChatResponse> {
    // 1. Rate limiting check per authenticated user
    if (!checkRateLimit(ctx.userId)) {
      throw new Error('Rate limit exceeded: You have sent too many AI requests. Please wait a minute before trying again.');
    }

    const lower = userMessage.toLowerCase();
    const contextPills: string[] = ['Tenant Isolated'];
    const suggestedActions: string[] = [];

    // 2. Fetch authorized contextual data based on employee/tenant
    let contextSummary = '';
    let journeyStats: any = null;
    let employeeGoals: any[] = [];
    let employeeSkills: any[] = [];

    if (ctx.employeeId) {
      try {
        const journeyResult = (await AITools.executeTool('getMyJourney', {}, ctx)) as any;
        journeyStats = journeyResult?.stats;
        if (journeyStats) {
          contextSummary += `\n- Current Journey Stage: ${journeyStats.currentStage} (${journeyStats.completionPercentage}% progress), Total Milestones: ${journeyStats.totalMilestones}, Next Target Stage: ${journeyStats.nextStage || 'Leadership'}`;
          contextPills.push(`Stage: ${journeyStats.currentStage}`);
        }
      } catch (e: any) {
        logger.warn('Could not retrieve journey context for AI', { err: e.message });
      }

      try {
        employeeGoals = (await AITools.executeTool('getMyGoals', {}, ctx)) as any[];
        if (employeeGoals.length > 0) {
          const activeGoals = employeeGoals.filter((g) => g.status !== 'COMPLETED');
          contextSummary += `\n- Active Goals (${activeGoals.length} of ${employeeGoals.length}): ` +
            activeGoals.map((g) => `${g.title} (${g.progressPercent}% - ${g.status})`).join('; ');
        }
      } catch (e: any) {
        logger.warn('Could not retrieve goals context for AI', { err: e.message });
      }

      try {
        employeeSkills = (await AITools.executeTool('getMySkills', {}, ctx)) as any[];
        if (employeeSkills.length > 0) {
          const gaps = employeeSkills.filter((s) => s.hasGap);
          if (gaps.length > 0) {
            contextSummary += `\n- Identified Skill Gaps: ` +
              gaps.map((g) => `${g.skillName} (Current: ${g.proficiency} -> Target: ${g.targetProficiency})`).join('; ');
          }
        }
      } catch (e: any) {
        logger.warn('Could not retrieve skills context for AI', { err: e.message });
      }
    }

    // 3. Document / Policy retrieval (RAG)
    const ragSources = await RAGService.searchKnowledgeBase(
      userMessage,
      ctx.organizationId,
      ctx.userRole,
      3
    );

    let ragContext = '';
    if (ragSources.length > 0) {
      ragContext = ragSources.map((s) => `[Source: ${s.title}]\n${s.snippet}`).join('\n\n');
      ragSources.forEach((s) => contextPills.push(`Doc: ${s.title}`));
    }

    // 4. If OpenAI API key is configured and valid, invoke OpenAI Chat Completion
    const apiKey = config.ai.apiKey;
    const isMockOrPlaceholder = !apiKey || apiKey.startsWith('your-') || apiKey === 'placeholder';

    if (!isMockOrPlaceholder) {
      try {
        const systemPrompt = `You are EJC Journey Copilot, an AI assistant built into the Employee Journey Cloud platform.
You are assisting an authorized employee (User Role: ${ctx.userRole}, Organization ID: ${ctx.organizationId}).
You must answer questions strictly based on the authorized context provided below.
If information is not in the context or known policies, state clearly that the information is not available in the employee record.
Do not fabricate employee facts, milestones, or organizational policies.
Keep responses concise, helpful, and formatted with markdown.

--- AUTHORIZED EMPLOYEE CONTEXT ---
${contextSummary || 'No specific employee profile record linked.'}

--- AUTHORIZED POLICY / KNOWLEDGE BASE EXCERPTS ---
${ragContext || 'No matching policy documents found.'}
-----------------------------------`;

        const gateway = config.ai.gatewayUrl.replace(/\/+$/, '');
        const endpoint = `${gateway}/chat/completions`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: config.ai.chatModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            temperature: 0.3,
            max_tokens: 800,
          }),
        });

        if (response.ok) {
          const completion = await response.json();
          const replyContent = completion.choices?.[0]?.message?.content;
          if (replyContent) {
            contextPills.push('OpenAI Powered');
            return {
              content: replyContent,
              sources: ragSources.length > 0 ? ragSources : undefined,
              contextPills,
              suggestedActions: [
                'View visual journey timeline',
                'Check active goals',
                'View required skill courses',
              ],
            };
          }
        } else {
          const errText = await response.text();
          logger.warn('OpenAI API request failed, using structured fallback response', {
            status: response.status,
            errText,
          });
        }
      } catch (err: any) {
        logger.error('Error contacting OpenAI API, using structured fallback', { err: err.message });
      }
    }

    // 5. High-fidelity Database-Aware Fallback if OpenAI Key is absent or external request fails
    if (lower.includes('journey') || lower.includes('milestone') || lower.includes('timeline')) {
      if (journeyStats) {
        return {
          content: `Your current employee journey stage is **${journeyStats.currentStage}** (${journeyStats.completionPercentage}% through core development milestones). You have unlocked **${journeyStats.totalMilestones} journey milestones** to date. Your next anticipated career checkpoint is **${journeyStats.nextStage || 'Leadership'}**.`,
          contextPills: [`Current Stage: ${journeyStats.currentStage}`, `${journeyStats.completionPercentage}% Progression`],
          suggestedActions: [
            'View full visual journey timeline',
            'What goals are active for this stage?',
            'What training should I complete next?',
          ],
        };
      }
    }

    if (lower.includes('goal') || lower.includes('target') || lower.includes('kpi')) {
      if (employeeGoals.length > 0) {
        const activeGoals = employeeGoals.filter((g) => g.status !== 'COMPLETED');
        return {
          content: `You currently have **${activeGoals.length} active goals** (${employeeGoals.length - activeGoals.length} completed):\n\n` +
            activeGoals.map((g) => `• **${g.title}** — ${g.progressPercent}% progress (${g.status})`).join('\n'),
          contextPills: [`Active Goals: ${activeGoals.length}`, `Total: ${employeeGoals.length}`],
          suggestedActions: [
            'Update goal progress',
            'How do these goals impact my promotion readiness?',
            'Create a new SMART goal',
          ],
        };
      }
    }

    if (lower.includes('skill') || lower.includes('gap') || lower.includes('learn') || lower.includes('course')) {
      if (employeeSkills.length > 0) {
        const gaps = employeeSkills.filter((s) => s.hasGap);
        return {
          content: `Based on your skill evaluation:\n\n` +
            (gaps.length > 0
              ? `We identified **${gaps.length} developmental skill gaps**:\n` +
                gaps.map((g) => `• **${g.skillName}**: Currently ${g.proficiency} → Target is ${g.targetProficiency}. *${g.reason}*`).join('\n')
              : `All your current skills meet or exceed your role baseline expectations!`),
          contextPills: [`Skills Evaluated: ${employeeSkills.length}`, `Gaps: ${gaps.length}`],
          suggestedActions: [
            'Recommend learning courses for gaps',
            'View career progression matrix',
            'Request skill verification from manager',
          ],
        };
      }
    }

    if (ragSources.length > 0) {
      const topSource = ragSources[0];
      return {
        content: `According to **${topSource.title}**:\n\n"${topSource.snippet}"\n\nPlease let me know if you would like clarification on how this policy applies to your journey stage.`,
        sources: ragSources,
        contextPills: [`Policy Citation: ${topSource.title}`, 'Authorized Knowledge Base'],
        suggestedActions: [
          'Show more details from this document',
          'Who is the HR contact for this policy?',
          'Submit a policy inquiry ticket',
        ],
      };
    }

    // Default response
    return {
      content: `I am your EJC Journey Copilot. I can assist you with your **Journey timeline**, **active goals & OKRs**, **skill gap recommendations**, and answer queries from authorized **company policies & handbooks**.\n\nTry asking me:\n• *"What is my current journey progress?"*\n• *"What are my active goals?"*\n• *"Explain my skill gaps."*\n• *"What is our remote work and leave policy?"*`,
      suggestedActions: [
        'What is my current journey progress?',
        'What are my active goals?',
        'Explain my skill gaps',
      ],
      contextPills: ['EJC Intelligent Assistant'],
    };
  }
}

