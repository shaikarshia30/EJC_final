import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { JourneyTimeline } from '../components/journey/JourneyTimeline.js';
import {
  ArrowLeft,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Target,
  Sparkles,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export const TeamMemberDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<any | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        const [empData, timelineData] = await Promise.all([
          api.employees.get360(id),
          api.journey.getTimeline(id).catch(() => []),
        ]);
        setEmployee(empData);
        setTimeline(timelineData);
      } catch (err: any) {
        setError(err.message || 'Failed to load team member dossier');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-fg-muted text-sm gap-3">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <span>Loading employee dossier...</span>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h2 className="text-lg font-semibold text-fg">Unable to load employee details</h2>
        <p className="text-xs text-fg-muted">{error || 'Employee not found.'}</p>
        <Link to="/team">
          <Button size="sm" variant="secondary" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Team Roster
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Back button */}
      <div>
        <Link
          to="/team"
          className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Team Overview</span>
        </Link>
      </div>

      {/* Header Profile Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={employee.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt=""
              className="w-16 h-16 rounded-full object-cover border-2 border-canvas-border"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-fg">
                  {employee.fullName || `${employee.firstName} ${employee.lastName}`}
                </h1>
                <Badge variant={employee.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                  {employee.status}
                </Badge>
              </div>
              <div className="text-xs text-accent-light font-medium">{employee.jobTitle}</div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-fg-muted pt-1">
                <span className="flex items-center gap-1 font-mono">
                  Code: {employee.employeeCode}
                </span>
                {employee.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {employee.location}
                  </span>
                )}
                <span className="flex items-center gap-1 font-mono text-accent-light">
                  Level {employee.currentLevel || 'L1'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/team-performance">
              <Button size="sm" variant="primary">
                Conduct Review
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Tabbed Grid: Goals + Skills + Journey */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Skills & Goals */}
        <div className="space-y-6 lg:col-span-1">
          {/* Active Goals */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-fg-muted uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-accent-light" />
                <span>Active OKRs</span>
              </div>
              <Badge variant="accent" size="sm">
                {employee.goals?.length || 0} Total
              </Badge>
            </div>
            {(!employee.goals || employee.goals.length === 0) ? (
              <p className="text-xs text-fg-muted italic">No goals assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {employee.goals.map((g: any) => (
                  <div key={g.id} className="p-2.5 rounded-lg bg-canvas-surface border border-canvas-border text-xs space-y-1.5">
                    <div className="font-medium text-fg">{g.title}</div>
                    <div className="flex justify-between text-[11px] text-fg-muted">
                      <span>{g.status}</span>
                      <span>{g.progressPercent}%</span>
                    </div>
                    <div className="w-full h-1 bg-canvas-card rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${g.progressPercent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Validated Skills */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-fg-muted uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent-light" />
                <span>Verified Skills</span>
              </div>
            </div>
            {(!employee.skills || employee.skills.length === 0) ? (
              <p className="text-xs text-fg-muted italic">No skills registered.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {employee.skills.map((s: any) => (
                  <span
                    key={s.id || s.skill?.name || s.name}
                    className="px-2 py-1 rounded bg-canvas-surface border border-canvas-border text-xs text-fg-muted"
                  >
                    {s.skill?.name || s.name || 'Skill'}
                  </span>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Journey Milestones */}
        <div className="lg:col-span-2">
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-canvas-border pb-3">
              <div className="text-xs font-semibold text-fg-muted uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-accent-light" />
                <span>Lifecycle Journey Timeline</span>
              </div>
              <span className="text-xs text-fg-muted">{timeline.length} Events Logged</span>
            </div>

            {timeline.length === 0 ? (
              <p className="text-xs text-fg-muted py-8 text-center">No journey milestones logged for this employee yet.</p>
            ) : (
              <JourneyTimeline events={timeline} />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
