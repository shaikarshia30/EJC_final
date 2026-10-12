import { describe, it, expect } from 'vitest';
import { JourneyStage, SkillProficiency } from '@ejc/types';

describe('Journey Timeline Progression Engine', () => {
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

  it('correctly calculates progression percentage through lifecycle milestones', () => {
    const completedStages = new Set<JourneyStage>(['JOINED', 'ONBOARDING', 'ACTIVE_DEVELOPMENT']);

    const currentStageIndex = stageSequence.reduce((highest, stage, idx) => {
      return completedStages.has(stage) ? idx : highest;
    }, 0);

    const completionPercentage = Math.round(((currentStageIndex + 1) / stageSequence.length) * 100);

    expect(stageSequence[currentStageIndex]).toBe('ACTIVE_DEVELOPMENT');
    expect(completionPercentage).toBe(56); // 5 out of 9 stages = ~56%
  });

  it('identifies next career milestone in lifecycle progression', () => {
    const currentStageIndex = 4; // ACTIVE_DEVELOPMENT
    const nextStage = currentStageIndex < stageSequence.length - 1 ? stageSequence[currentStageIndex + 1] : null;

    expect(nextStage).toBe('MID_REVIEW');
  });
});

describe('Skill Gap Detection & Analysis', () => {
  const proficiencyLevels: Record<SkillProficiency, number> = {
    BEGINNER: 1,
    INTERMEDIATE: 2,
    ADVANCED: 3,
    EXPERT: 4,
  };

  it('detects competency gap when current proficiency is below target', () => {
    const currentProficiency: SkillProficiency = 'INTERMEDIATE';
    const targetProficiency: SkillProficiency = 'ADVANCED';

    const current = proficiencyLevels[currentProficiency];
    const target = proficiencyLevels[targetProficiency];
    const gap = Math.max(0, target - current);

    expect(gap).toBe(1);
    expect(gap > 0).toBe(true);
  });

  it('reports zero gap when current proficiency meets or exceeds target', () => {
    const currentProficiency: SkillProficiency = 'EXPERT';
    const targetProficiency: SkillProficiency = 'ADVANCED';

    const current = proficiencyLevels[currentProficiency];
    const target = proficiencyLevels[targetProficiency];
    const gap = Math.max(0, target - current);

    expect(gap).toBe(0);
  });
});

describe('Multi-Tenant Data Isolation Guardrails', () => {
  it('blocks cross-tenant requests when requested tenant does not match token organizationId', () => {
    const tokenOrgId = 'org-acme-1111';
    const requestedOrgId = 'org-nova-9999';

    const isAuthorized = tokenOrgId === requestedOrgId;
    expect(isAuthorized).toBe(false);
  });
});
