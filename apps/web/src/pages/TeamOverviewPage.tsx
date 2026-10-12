import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { Users, Search, ArrowRight, Mail, MapPin, ChevronRight, AlertCircle, Plus } from 'lucide-react';

export const TeamOverviewPage: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await api.employees.list({ search: search.trim() ? search.trim() : undefined });
        setEmployees(res.items || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load team roster');
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [search]);

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-canvas-border pb-6">
        <div>
          <div className="text-xs font-semibold text-accent-light uppercase tracking-wider mb-1">
            MANAGEMENT SUITE
          </div>
          <h1 className="text-2xl font-bold text-fg tracking-tight">Team Overview & Roster</h1>
          <p className="text-xs text-fg-muted mt-0.5">
            Monitor direct reports, probationary checkpoints, and journey progressions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/team-performance">
            <Button size="sm" variant="secondary">
              Performance Reviews
            </Button>
          </Link>
          <Link to="/projects">
            <Button size="sm" variant="primary">
              View Team Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-canvas-card border border-canvas-border p-3 rounded-xl">
        <Search className="w-4 h-4 text-fg-muted ml-1" />
        <input
          type="text"
          placeholder="Filter team members by name or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm text-fg placeholder-fg-muted focus:outline-none w-full"
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Team Roster Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-fg-muted text-sm gap-3">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span>Loading team members...</span>
        </div>
      ) : employees.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-canvas-border bg-canvas-card/30">
          <Users className="w-8 h-8 text-fg-muted mx-auto mb-2" />
          <h3 className="text-sm font-medium text-fg">No team members found</h3>
          <p className="text-xs text-fg-muted mt-1 max-w-sm mx-auto">
            {search ? 'Try clearing your filter search query.' : 'No employee records are registered in your team.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((member) => (
            <Card key={member.id} className="p-5 flex flex-col justify-between hover:border-canvas-border-hover transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-canvas-border"
                    />
                    <div>
                      <div className="font-semibold text-sm text-fg">{member.fullName || `${member.firstName} ${member.lastName}`}</div>
                      <div className="text-xs text-fg-muted">{member.jobTitle}</div>
                    </div>
                  </div>
                  <Badge variant={member.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                    {member.status}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-fg-subtle pt-2 border-t border-canvas-border/60">
                  <div className="flex items-center justify-between">
                    <span>Department:</span>
                    <span className="text-fg-muted font-medium">{member.departmentName || 'General'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Current Level:</span>
                    <span className="text-accent-light font-mono font-medium">{member.currentLevel || 'L1'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Joined:</span>
                    <span className="text-fg-muted">{new Date(member.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-canvas-border flex items-center justify-between">
                <span className="text-[11px] font-mono text-fg-muted">{member.employeeCode}</span>
                <Link
                  to={`/team/${member.id}`}
                  className="inline-flex items-center gap-1 text-xs text-accent-light hover:text-accent font-medium transition-colors"
                >
                  <span>Journey Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
