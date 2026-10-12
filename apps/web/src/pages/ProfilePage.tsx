import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { JourneyTimeline } from '../components/journey/JourneyTimeline.js';
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Target,
  Sparkles,
  BookOpen,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
  Phone,
  GraduationCap,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'journey' | 'performance' | 'skills' | 'history'>('overview');
  const [profile, setProfile] = useState<any | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const employeeId = user?.employee?.id;

  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const [pData, tData] = await Promise.all([
          api.employees.get360(employeeId),
          api.journey.getTimeline(employeeId).catch(() => []),
        ]);
        setProfile(pData);
        setTimeline(tData || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load employee dossier');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-fg-muted text-sm gap-3">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <span>Loading employee dossier...</span>
      </div>
    );
  }

  const emp = profile || user?.employee || {};

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-canvas-card border border-canvas-border rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start md:items-center gap-5">
            <img
              src={emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt=""
              className="w-20 h-20 rounded-full object-cover border-2 border-canvas-border shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-fg tracking-tight">
                  {emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`}
                </h1>
                <Badge variant="accent">Level {emp.currentLevel || 'L1'}</Badge>
                <Badge variant={emp.status === 'ACTIVE' ? 'success' : 'warning'}>{emp.status || 'ACTIVE'}</Badge>
              </div>
              <div className="text-sm text-fg-muted flex items-center gap-2">
                <span>{emp.jobTitle || 'Specialist'}</span>
                <span>•</span>
                <span>{emp.departmentName || 'General'}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-fg-subtle pt-1">
                {emp.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {emp.email}
                  </span>
                )}
                {emp.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {emp.phone}
                  </span>
                )}
                {emp.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {emp.location}
                  </span>
                )}
                {emp.joinedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {new Date(emp.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-canvas-border flex items-center gap-6 text-sm font-medium">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'journey', label: `Journey Timeline (${timeline.length})` },
          { id: 'performance', label: `Goals (${emp.goals?.length || 0})` },
          { id: 'skills', label: `Skills (${emp.skills?.length || 0})` },
          { id: 'history', label: 'Qualifications & Background' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 transition-colors relative ${
              activeTab === tab.id
                ? 'text-fg font-semibold'
                : 'text-fg-muted hover:text-fg'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="space-y-4">
            <div className="text-xs font-semibold text-fg-muted uppercase tracking-wider">
              Dossier Snapshot
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-fg-muted">Code:</span>
                <span className="font-mono text-fg">{emp.employeeCode || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-fg-muted">Milestones Logged:</span>
                <span className="font-semibold text-fg">{timeline.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-fg-muted">Active Goals:</span>
                <span className="font-semibold text-state-success">{emp.goals?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-fg-muted">Registered Skills:</span>
                <span className="font-semibold text-fg">{emp.skills?.length || 0}</span>
              </div>
            </div>
          </Card>

          {/* Reporting Structure */}
          <Card className="space-y-4">
            <div className="text-xs font-semibold text-fg-muted uppercase tracking-wider">
              Reporting Line
            </div>
            {emp.manager ? (
              <div className="flex items-center gap-3 p-2.5 rounded-md bg-canvas-surface border border-canvas-border">
                <img
                  src={emp.manager.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-medium text-fg">
                    {emp.manager.firstName} {emp.manager.lastName}
                  </div>
                  <div className="text-[11px] text-fg-muted">{emp.manager.jobTitle}</div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-fg-muted italic">Reporting directly to Executive / Admin.</p>
            )}
          </Card>

          {/* Emergency Contact */}
          <Card className="space-y-4">
            <div className="text-xs font-semibold text-fg-muted uppercase tracking-wider">
              Emergency & Location
            </div>
            <div className="space-y-2 text-xs text-fg-muted">
              <div>
                <span className="text-fg-subtle">Address: </span>
                <span>{emp.address || '—'}</span>
              </div>
              <div>
                <span className="text-fg-subtle">Emergency Contact: </span>
                <span>
                  {emp.emergencyContact?.name
                    ? `${emp.emergencyContact.name} (${emp.emergencyContact.relationship || 'Contact'}) — ${emp.emergencyContact.phone || ''}`
                    : '—'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Journey Timeline */}
      {activeTab === 'journey' && (
        <div>
          {timeline.length === 0 ? (
            <p className="text-xs text-fg-muted py-8 text-center">No journey milestones logged yet.</p>
          ) : (
            <JourneyTimeline events={timeline} />
          )}
        </div>
      )}

      {/* Tab: Goals */}
      {activeTab === 'performance' && (
        <div className="space-y-4">
          {(!emp.goals || emp.goals.length === 0) ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-canvas-border bg-canvas-card/30 text-xs text-fg-muted">
              No performance goals assigned yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emp.goals.map((goal: any) => (
                <Card key={goal.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={goal.status === 'COMPLETED' ? 'success' : 'accent'}>
                      {goal.status}
                    </Badge>
                    <span className="text-xs text-fg-subtle">
                      Due: {new Date(goal.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-fg">{goal.title}</h3>
                  {goal.description && <p className="text-xs text-fg-muted">{goal.description}</p>}
                  <div className="space-y-1 pt-2 border-t border-canvas-border">
                    <div className="flex justify-between text-xs text-fg-subtle">
                      <span>Progress</span>
                      <span className="font-medium text-fg">{goal.progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-canvas-surface rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${goal.progressPercent}%` }} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Skills */}
      {activeTab === 'skills' && (
        <div>
          {(!emp.skills || emp.skills.length === 0) ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-canvas-border bg-canvas-card/30 text-xs text-fg-muted">
              No skills registered to profile yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emp.skills.map((skill: any) => (
                <Card key={skill.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-fg">
                      {skill.skill?.name || skill.name || skill.skillName || 'Skill'}
                    </h3>
                    <Badge variant="accent">{skill.proficiency || 'INTERMEDIATE'}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: History (Education & Experience from Onboarding) */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <Card className="space-y-3">
            <h3 className="text-sm font-semibold text-fg flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-accent-light" />
              <span>Education & Credentials</span>
            </h3>
            {(!emp.education || !Array.isArray(emp.education) || emp.education.length === 0) ? (
              <p className="text-xs text-fg-muted italic">No education history recorded.</p>
            ) : (
              <div className="space-y-2 text-xs">
                {emp.education.map((edu: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded bg-canvas-surface border border-canvas-border flex justify-between">
                    <div>
                      <div className="font-medium text-fg">{edu.degree}</div>
                      <div className="text-fg-muted">{edu.institution}</div>
                    </div>
                    <span className="font-mono text-fg-subtle">{edu.year}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="space-y-3">
            <h3 className="text-sm font-semibold text-fg flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-accent-light" />
              <span>Work Experience History</span>
            </h3>
            {(!emp.workExperience || !Array.isArray(emp.workExperience) || emp.workExperience.length === 0) ? (
              <p className="text-xs text-fg-muted italic">No prior experience recorded.</p>
            ) : (
              <div className="space-y-2 text-xs">
                {emp.workExperience.map((exp: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded bg-canvas-surface border border-canvas-border flex justify-between">
                    <div>
                      <div className="font-medium text-fg">{exp.role}</div>
                      <div className="text-fg-muted">{exp.company}</div>
                    </div>
                    <span className="font-mono text-fg-subtle">{exp.duration}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
