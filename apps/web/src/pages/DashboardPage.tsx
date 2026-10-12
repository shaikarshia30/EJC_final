import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { JourneyTimeline } from '../components/journey/JourneyTimeline.js';
import {
  Compass,
  Target,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Bot,
  Users,
  Building,
  FolderKanban,
  Award,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user, role, toggleAssistant } = useAuth();
  const [timeline, setTimeline] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [hrStats, setHrStats] = useState<any | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const emp = user?.employee;

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (role === 'ORG_ADMIN' || role === 'HR_MANAGER' || role === 'SUPER_ADMIN') {
          // HR / CEO View (Screen 15)
          const [analytics, projData, empList] = await Promise.all([
            api.analytics.getHR().catch(() => null),
            api.projects.list().catch(() => []),
            api.employees.list().catch(() => ({ total: 0, items: [] })),
          ]);
          setHrStats(analytics);
          setProjects(projData || []);
          setTeamMembers(empList.items || []);
        } else if (role === 'MANAGER') {
          // Manager View (Screen 11)
          const [empList, projData] = await Promise.all([
            api.employees.list().catch(() => ({ total: 0, items: [] })),
            api.projects.list().catch(() => []),
          ]);
          setTeamMembers(empList.items || []);
          setProjects(projData || []);
        } else if (emp?.id) {
          // Employee View (Screen 6)
          const [events, goalList, skillList] = await Promise.all([
            api.journey.getTimeline(emp.id).catch(() => []),
            api.performance.getGoals(emp.id).catch(() => []),
            api.skills.getEmployeeSkills(emp.id).catch(() => []),
          ]);
          setTimeline(events || []);
          setGoals(goalList || []);
          setSkills(skillList || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [role, emp?.id]);

  // =========================================================================
  // VIEW 1: HR / CEO EXECUTIVE DASHBOARD (Screen 15)
  // =========================================================================
  if (role === 'ORG_ADMIN' || role === 'HR_MANAGER' || role === 'SUPER_ADMIN') {
    return (
      <div className="space-y-8 pb-12 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-canvas-border pb-6">
          <div>
            <div className="text-xs font-semibold text-accent-light uppercase tracking-wider mb-1">
              EXECUTIVE HR & WORKFORCE COMMAND
            </div>
            <h1 className="text-2xl font-bold text-fg tracking-tight">
              Organization Overview — {user?.organizationName || 'Acme'}
            </h1>
            <p className="text-xs text-fg-muted mt-0.5">
              Workforce dynamics, onboarding pipeline velocity, and active initiative governance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/people">
              <Button size="sm" variant="secondary" icon={<Users className="w-3.5 h-3.5" />}>
                People Directory
              </Button>
            </Link>
            <Link to="/analytics">
              <Button size="sm" variant="primary" icon={<TrendingUp className="w-3.5 h-3.5" />}>
                Deep Analytics
              </Button>
            </Link>
          </div>
        </div>

        {/* Executive Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-fg-muted">
              <span>Total Workforce</span>
              <Users className="w-4 h-4 text-accent-light" />
            </div>
            <div className="text-2xl font-bold text-fg">{hrStats?.totalEmployees ?? teamMembers.length}</div>
            <div className="text-[11px] text-state-success flex items-center gap-1">
              <span>Verified Directory Members</span>
            </div>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-fg-muted">
              <span>Active Onboarding</span>
              <Compass className="w-4 h-4 text-ai-purple" />
            </div>
            <div className="text-2xl font-bold text-fg">{hrStats?.onboardingCount ?? 0}</div>
            <div className="text-[11px] text-fg-subtle">
              <span>Employees in Probation / Onboarding</span>
            </div>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-fg-muted">
              <span>Initiatives / Projects</span>
              <FolderKanban className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-fg">{projects.length}</div>
            <div className="text-[11px] text-fg-subtle">
              <span>Active Cross-Functional Streams</span>
            </div>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-fg-muted">
              <span>Tenant Health</span>
              <ShieldCheck className="w-4 h-4 text-state-success" />
            </div>
            <div className="text-2xl font-bold text-state-success">ACTIVE</div>
            <div className="text-[11px] text-fg-subtle">
              <span>RBAC & Vector RAG Enforced</span>
            </div>
          </Card>
        </div>

        {/* Department Breakdown & Projects Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-canvas-border pb-3">
              <h2 className="text-sm font-semibold text-fg uppercase tracking-wider">
                Workforce Distribution
              </h2>
              <Link to="/people" className="text-xs text-accent-light hover:underline">
                View All
              </Link>
            </div>
            {(!hrStats?.departments || hrStats.departments.length === 0) ? (
              <p className="text-xs text-fg-muted py-6 text-center">No departmental groupings registered yet.</p>
            ) : (
              <div className="space-y-3">
                {hrStats.departments.map((d: any) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <span className="text-fg font-medium">{d.name}</span>
                    <span className="text-fg-muted font-mono">{d.headcount} members</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-canvas-border pb-3">
              <h2 className="text-sm font-semibold text-fg uppercase tracking-wider">
                Active Strategic Projects
              </h2>
              <Link to="/projects" className="text-xs text-accent-light hover:underline">
                Manage
              </Link>
            </div>
            {projects.length === 0 ? (
              <p className="text-xs text-fg-muted py-6 text-center">No projects configured.</p>
            ) : (
              <div className="space-y-2.5">
                {projects.slice(0, 4).map((p: any) => (
                  <div key={p.id} className="p-2.5 rounded bg-canvas-surface border border-canvas-border flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-fg">{p.name}</div>
                      <div className="text-[10px] text-fg-muted">{p.code || 'STREAM'} • {p.members?.length || 0} members</div>
                    </div>
                    <Badge variant={p.status === 'ACTIVE' ? 'success' : 'accent'} size="sm">
                      {p.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Live Milestone Activity Feed */}
        {hrStats?.recentMilestones && hrStats.recentMilestones.length > 0 && (
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-canvas-border pb-3">
              <h2 className="text-sm font-semibold text-fg uppercase tracking-wider">
                Live Organization Lifecycle Activity
              </h2>
            </div>
            <JourneyTimeline events={hrStats.recentMilestones.slice(0, 4)} />
          </Card>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: MANAGER DASHBOARD (Screen 11)
  // =========================================================================
  if (role === 'MANAGER') {
    return (
      <div className="space-y-8 pb-12 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-canvas-border pb-6">
          <div>
            <div className="text-xs font-semibold text-accent-light uppercase tracking-wider mb-1">
              PEOPLE MANAGEMENT PORTAL
            </div>
            <h1 className="text-2xl font-bold text-fg tracking-tight">
              Manager Command Dashboard
            </h1>
            <p className="text-xs text-fg-muted mt-0.5">
              Direct report tracking, probationary milestone reviews, and team goal execution
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/team">
              <Button size="sm" variant="secondary" icon={<Users className="w-3.5 h-3.5" />}>
                Team Roster
              </Button>
            </Link>
            <Link to="/team-performance">
              <Button size="sm" variant="primary" icon={<Award className="w-3.5 h-3.5" />}>
                Reviews & Ratings
              </Button>
            </Link>
          </div>
        </div>

        {/* Manager Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-fg-muted">
              <span>Direct Reports</span>
              <Users className="w-4 h-4 text-accent-light" />
            </div>
            <div className="text-2xl font-bold text-fg">{teamMembers.length}</div>
            <div className="text-[11px] text-fg-subtle">Direct & department members</div>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-fg-muted">
              <span>Team Initiatives</span>
              <FolderKanban className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-fg">{projects.length}</div>
            <div className="text-[11px] text-fg-subtle">Assigned active projects</div>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-fg-muted">
              <span>Reviews Due</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-fg">Active Cycle</div>
            <div className="text-[11px] text-fg-subtle">Annual 360 evaluation open</div>
          </Card>
        </div>

        {/* Direct Reports Quick Roster */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-canvas-border pb-3">
            <h2 className="text-sm font-semibold text-fg uppercase tracking-wider">
              Team Members & Direct Reports
            </h2>
            <Link to="/team" className="text-xs text-accent-light hover:underline">
              Full Roster
            </Link>
          </div>

          {teamMembers.length === 0 ? (
            <p className="text-xs text-fg-muted py-6 text-center">No reports assigned to your team yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {teamMembers.slice(0, 6).map((m: any) => (
                <div
                  key={m.id}
                  className="p-3 rounded-lg bg-canvas-surface border border-canvas-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-canvas-border"
                    />
                    <div>
                      <div className="text-xs font-semibold text-fg">{m.fullName || `${m.firstName} ${m.lastName}`}</div>
                      <div className="text-[10px] text-fg-muted">{m.jobTitle}</div>
                    </div>
                  </div>
                  <Link to={`/team/${m.id}`} className="text-accent-light hover:text-accent">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: EMPLOYEE DASHBOARD (Screen 6)
  // =========================================================================
  return (
    <div className="space-y-8 pb-12 max-w-6xl">
      {/* 1. Greeting & Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-canvas-border pb-6">
        <div>
          <div className="text-xs font-semibold text-accent-light uppercase tracking-wider mb-1">
            Employee Journey Portal
          </div>
          <h1 className="text-2xl font-bold text-fg tracking-tight">
            Welcome back, {emp?.firstName || 'Colleague'}
          </h1>
          <p className="text-xs text-fg-muted mt-0.5">
            Stage: <span className="text-fg font-medium">ACTIVE_DEVELOPMENT</span> • Role:{' '}
            <span className="text-accent-light font-medium">{emp?.jobTitle || 'Team Member'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<Bot className="w-3.5 h-3.5 text-ai-purple" />}
            onClick={toggleAssistant}
          >
            Ask Copilot
          </Button>
          <Link to="/journey">
            <Button size="sm" variant="primary" icon={<Compass className="w-3.5 h-3.5" />}>
              Explore Journey
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Structured Composition: Journey Progression + Current Goals + Skills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Journey Progress */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-fg-muted uppercase tracking-wider">
              Journey Progress
            </div>
            <Badge variant="accent" size="sm">
              {timeline.length} Milestones
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="text-lg font-bold text-fg tracking-tight">
              {timeline.length > 0 ? `${timeline.length} Milestones Logged` : 'Journey Initialized'}
            </div>
            <p className="text-xs text-fg-muted leading-relaxed">
              Every onboarding task, goal completion, and skill accreditation is continuously tracked on your lifecycle graph.
            </p>
          </div>

          <div className="w-full h-1.5 bg-canvas-surface rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.min(100, timeline.length * 20)}%` }} />
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-fg-subtle">
            <span>Stage: ACTIVE</span>
            <Link to="/journey" className="text-accent-light hover:underline flex items-center gap-1">
              View Timeline <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Current Goals (SMART OKRs) */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-fg-muted uppercase tracking-wider">
              Current Goals
            </div>
            <span className="text-xs text-state-success font-medium">{goals.length} Active</span>
          </div>

          {goals.length === 0 ? (
            <p className="text-xs text-fg-muted py-4 italic">No active goals yet. Create one in Goals & OKRs.</p>
          ) : (
            <div className="space-y-3">
              {goals.slice(0, 2).map((g) => (
                <div key={g.id} className="space-y-1.5">
                  <div className="text-xs font-medium text-fg truncate">• {g.title}</div>
                  <div className="w-full h-1.5 bg-canvas-surface rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${g.progressPercent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-xs text-fg-subtle">
            <span>OKRs Assigned: {goals.length}</span>
            <Link to="/goals" className="text-accent-light hover:underline flex items-center gap-1">
              All Goals <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Career Trajectory */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-fg-muted uppercase tracking-wider">
              Career Trajectory
            </div>
            <Badge variant="success" size="sm">
              Level {emp?.currentLevel || 'L1'}
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-fg-subtle">Designated Role</div>
            <div className="text-sm font-semibold text-fg">{emp?.jobTitle || 'Specialist'}</div>
            <p className="text-[11px] text-fg-muted">
              Continuous performance reviews and skill validations build toward your next progression level.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-fg-subtle">
            <span>Promotion Path</span>
            <Link to="/career" className="text-accent-light hover:underline flex items-center gap-1">
              Career Path <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </div>

      {/* 3. Interactive Journey Timeline Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-fg tracking-tight">
              Employee Journey Timeline
            </h2>
            <p className="text-xs text-fg-muted">
              Live chronological feed of your verified milestones and career developments.
            </p>
          </div>
          <Link to="/journey">
            <Button size="sm" variant="secondary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
              Full Journey
            </Button>
          </Link>
        </div>

        {timeline.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-canvas-border bg-canvas-card/20">
            <Compass className="w-6 h-6 text-fg-muted mx-auto mb-2" />
            <p className="text-xs text-fg-muted">No journey milestones logged yet. Complete tasks and achieve goals to populate your graph.</p>
          </div>
        ) : (
          <JourneyTimeline events={timeline.slice(0, 4)} />
        )}
      </div>

      {/* 4. Skills & Learning Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-fg-muted uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent-light" />
              <span>Registered Skills ({skills.length})</span>
            </div>
            <Link to="/skills" className="text-xs text-accent-light hover:underline">
              View Matrix
            </Link>
          </div>

          {skills.length === 0 ? (
            <p className="text-xs text-fg-muted py-4 italic">No skills registered yet. Add competencies in Skill Matrix.</p>
          ) : (
            <div className="space-y-2">
              {skills.slice(0, 3).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-2.5 rounded bg-canvas-surface border border-canvas-border">
                  <span className="text-xs font-medium text-fg">{s.skill?.name || s.name || 'Skill'}</span>
                  <Badge variant="accent" size="sm">{s.proficiency || 'INTERMEDIATE'}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-fg-muted uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-accent-light" />
              <span>Learning & Development</span>
            </div>
            <Link to="/learning" className="text-xs text-accent-light hover:underline">
              Academy
            </Link>
          </div>
          <p className="text-xs text-fg-muted leading-relaxed">
            Upskill across strategic frameworks, engineering patterns, and cloud competencies tailored to your career ladder.
          </p>
          <div className="pt-2">
            <Link to="/learning">
              <Button size="sm" variant="secondary" className="w-full">
                Explore Learning Pathways
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
