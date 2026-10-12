import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { JourneyTimeline } from '../components/journey/JourneyTimeline.js';
import { BarChart3, Users, Target, CheckCircle2, TrendingUp, Compass, AlertCircle } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const stats = await api.analytics.getHR();
        setData(stats);
      } catch (err: any) {
        setError(err.message || 'Failed to load workforce analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      <div className="border-b border-canvas-border pb-4">
        <h1 className="text-xl font-bold text-fg tracking-tight">Workforce & Journey Analytics</h1>
        <p className="text-xs text-fg-muted mt-0.5">
          Executive and departmental insights across lifecycle progression, onboarding velocities, and OKR execution.
        </p>
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
          <span>Aggregating workforce telemetry...</span>
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 space-y-1">
              <div className="text-xs text-fg-subtle">Total Workforce</div>
              <div className="text-2xl font-bold text-fg tracking-tight">{data?.totalEmployees ?? 0}</div>
              <div className="text-[11px] text-state-success flex items-center gap-1 pt-1">
                <Users className="w-3 h-3" /> Registered Profiles
              </div>
            </Card>

            <Card className="p-4 space-y-1">
              <div className="text-xs text-fg-subtle">In Onboarding</div>
              <div className="text-2xl font-bold text-fg tracking-tight">{data?.onboardingCount ?? 0}</div>
              <div className="text-[11px] text-fg-muted pt-1">
                Active probationary onboarding
              </div>
            </Card>

            <Card className="p-4 space-y-1">
              <div className="text-xs text-fg-subtle">Departments</div>
              <div className="text-2xl font-bold text-fg tracking-tight">{data?.departments?.length ?? 0}</div>
              <div className="text-[11px] text-state-success flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3 h-3" /> Organizational Units
              </div>
            </Card>

            <Card className="p-4 space-y-1">
              <div className="text-xs text-fg-subtle">Tenant Status</div>
              <div className="text-2xl font-bold text-state-success tracking-tight">ACTIVE</div>
              <div className="text-[11px] text-fg-muted pt-1">
                Multi-Tenant Isolation
              </div>
            </Card>
          </div>

          {/* Department Breakdown & Milestone Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="space-y-4">
              <div className="text-xs font-semibold text-fg-muted uppercase tracking-wider">
                Department Workforce Distribution
              </div>
              {(!data?.departments || data.departments.length === 0) ? (
                <p className="text-xs text-fg-muted py-6 text-center italic">No departments registered yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.departments.map((dept: any, idx: number) => {
                    const total = data.totalEmployees || 1;
                    const pct = Math.round((dept.headcount / total) * 100);

                    return (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-fg">{dept.name}</span>
                          <span className="text-fg-muted">{dept.headcount} members ({pct}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-canvas-surface rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="space-y-4">
              <div className="text-xs font-semibold text-fg-muted uppercase tracking-wider">
                Organization Journey Milestones (Live Feed)
              </div>
              {(!data?.recentMilestones || data.recentMilestones.length === 0) ? (
                <p className="text-xs text-fg-muted py-6 text-center italic">No milestones emitted across organization yet.</p>
              ) : (
                <JourneyTimeline events={data.recentMilestones.slice(0, 5)} />
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
