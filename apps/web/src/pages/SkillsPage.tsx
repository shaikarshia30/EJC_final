import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, AlertCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SkillsPage: React.FC = () => {
  const { user, role } = useAuth();
  const [skills, setSkills] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const employeeId = user?.employee?.id;
  const isManagerOrAdmin = ['MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'].includes(role || '');

  const loadSkills = async () => {
    if (!employeeId) {
      setLoading(false);
      return;
    }

    try {
      const [empSkills, cat] = await Promise.all([
        api.skills.getEmployeeSkills(employeeId),
        api.skills.getCatalog().catch(() => []),
      ]);
      setSkills(empSkills || []);
      setCatalog(cat || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load skill matrix');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, [employeeId]);

  const handleVerify = async (skillId: string) => {
    try {
      await api.skills.verify(skillId);
      await loadSkills();
    } catch (err: any) {
      setError(err.message || 'Failed to verify competency');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-canvas-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-fg tracking-tight">Skill Matrix & Gap Intelligence</h1>
          <p className="text-xs text-fg-muted mt-0.5">
            Real-time competency tracking, manager verification, and explainable developmental gap detection.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-fg-muted text-sm gap-3">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span>Loading skill matrix...</span>
        </div>
      ) : skills.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-canvas-border bg-canvas-card/30">
          <Sparkles className="w-8 h-8 text-fg-muted mx-auto mb-2" />
          <h3 className="text-sm font-medium text-fg">No skills mapped to profile yet</h3>
          <p className="text-xs text-fg-muted mt-1 max-w-sm mx-auto">
            Skills will appear as you complete onboarding checkpoints, certifications, and project assignments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill: any) => {
            const skillName = skill.skill?.name || skill.skillName || 'Skill';
            const proficiency = skill.proficiency || 'INTERMEDIATE';
            const isVerified = Boolean(skill.verifiedAt || skill.isVerified);

            return (
              <Card key={skill.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-fg">{skillName}</h3>
                    {isVerified ? (
                      <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Pending Verification
                      </Badge>
                    )}
                  </div>
                  <Badge variant="accent">{proficiency}</Badge>
                </div>

                <div className="text-xs text-fg-muted space-y-1 bg-canvas-surface p-3 rounded border border-canvas-border">
                  <div className="flex justify-between">
                    <span>Proficiency Level:</span>
                    <span className="text-fg font-medium">{proficiency}</span>
                  </div>
                  {skill.targetProficiency && (
                    <div className="flex justify-between">
                      <span>Target Level:</span>
                      <span className="text-accent-light font-medium">{skill.targetProficiency}</span>
                    </div>
                  )}
                  {isVerified && (
                    <div className="flex justify-between pt-1 text-[11px] text-fg-subtle border-t border-canvas-border/50">
                      <span>Status:</span>
                      <span className="text-emerald-400">Validated</span>
                    </div>
                  )}
                </div>

                {isManagerOrAdmin && !isVerified && (
                  <div className="pt-1 flex justify-end">
                    <Button size="sm" variant="secondary" onClick={() => handleVerify(skill.id)}>
                      Verify Competency
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
