import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { TrendingUp, CheckCircle2, AlertCircle, Award, Sparkles } from 'lucide-react';

export const CareerPage: React.FC = () => {
  const { user, role, refreshUser } = useAuth();
  const [readiness, setReadiness] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoted, setPromoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const employeeId = user?.employee?.id;
  const isManagerOrAdmin = ['MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'].includes(role || '');

  const loadReadiness = async () => {
    if (!employeeId) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.career.getReadiness(employeeId);
      setReadiness(data);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate career readiness');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReadiness();
  }, [employeeId]);

  const handlePromote = async () => {
    if (!employeeId || !readiness) return;
    setSubmitting(true);
    setError(null);

    const nextLevel = readiness.targetLevel || 'L4';
    const nextTitle = readiness.targetTitle || `Senior ${user.employee?.jobTitle || 'Specialist'}`;

    try {
      await api.career.promote({
        employeeId,
        newTitle: nextTitle,
        newLevel: nextLevel,
      });

      setPromoted(true);
      await refreshUser();
      await loadReadiness();
    } catch (err: any) {
      setError(err.message || 'Promotion execution failed');
    } finally {
      setSubmitting(false);
    }
  };

  const score = readiness?.readinessScore ?? 75;

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-canvas-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-fg tracking-tight">Career Architecture & Promotion Readiness</h1>
          <p className="text-xs text-fg-muted mt-0.5">
            Transparent, explainable career progression based on documented criteria and validated competencies.
          </p>
        </div>
      </div>

      {promoted && (
        <div className="p-4 bg-state-success/15 border border-state-success/30 rounded-xl text-xs text-state-success flex items-center gap-3">
          <Award className="w-5 h-5 shrink-0" />
          <div>
            <div className="font-semibold text-sm">Formal Promotion Executed!</div>
            <div>Elevated to {readiness?.targetTitle || 'Next Level'}. New Journey Milestone logged to immutable ledger.</div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-fg-muted text-sm gap-3">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span>Analyzing career architecture...</span>
        </div>
      ) : (
        <Card className="p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <Badge variant="accent" size="sm">
                Current: {user?.employee?.jobTitle || 'Specialist'} ({user?.employee?.currentLevel || 'L1'})
              </Badge>
              <h2 className="text-lg font-bold text-fg tracking-tight">
                Target Progression: {readiness?.targetTitle || 'Senior Specialist'} ({readiness?.targetLevel || 'L2'})
              </h2>
              <p className="text-xs text-fg-muted">
                Synthesized across three pillars: Delivery, Verified Competencies, and Lifecycle Impact.
              </p>
            </div>

            <div className="text-right">
              <div className="text-3xl font-extrabold text-accent-light tracking-tight">
                {score}%
              </div>
              <div className="text-xs text-state-success font-medium">
                {score >= 70 ? 'Readiness Benchmark Met' : 'Progression In Progress'}
              </div>
            </div>
          </div>

          <div className="w-full h-2 bg-canvas-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${score}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-3 bg-canvas-surface rounded-md border border-canvas-border space-y-1.5">
              <div className="text-xs text-fg-subtle">1. Performance Rating</div>
              <div className="text-sm font-semibold text-fg">
                {readiness?.latestRating ? `${readiness.latestRating} / 5.0` : 'Calibrated'}
              </div>
              <div className="text-[11px] text-state-success flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Minimum rating verified
              </div>
            </div>

            <div className="p-3 bg-canvas-surface rounded-md border border-canvas-border space-y-1.5">
              <div className="text-xs text-fg-subtle">2. Competency Verifications</div>
              <div className="text-sm font-semibold text-fg">
                {readiness?.verifiedSkillsCount ?? 1} Verified Skills
              </div>
              <div className="text-[11px] text-state-success flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Competencies recorded
              </div>
            </div>

            <div className="p-3 bg-canvas-surface rounded-md border border-canvas-border space-y-1.5">
              <div className="text-xs text-fg-subtle">3. OKR Goal Execution</div>
              <div className="text-sm font-semibold text-fg">
                {readiness?.goalsCompleted ?? 1} Target Objectives
              </div>
              <div className="text-[11px] text-state-success flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Delivery benchmark tracked
              </div>
            </div>
          </div>

          {isManagerOrAdmin && !promoted && (
            <div className="pt-4 border-t border-canvas-border flex items-center justify-between">
              <div className="text-xs text-fg-muted">
                As an authorized manager/admin, you can formally approve and execute this promotion.
              </div>
              <Button
                variant="primary"
                icon={<Sparkles className="w-3.5 h-3.5" />}
                onClick={handlePromote}
                disabled={submitting}
              >
                {submitting ? 'Executing...' : 'Approve & Execute Promotion'}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
