import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { Search, Users, ExternalLink, MapPin, AlertCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PeoplePage: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.employees.list({ search: search.trim() ? search.trim() : undefined });
        setEmployees(res.items || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load employee directory');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [search]);

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-canvas-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-fg tracking-tight">Organization Directory</h1>
          <p className="text-xs text-fg-muted mt-0.5">
            Discover team members, reporting structures, and verified Employee 360 dossiers.
          </p>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-fg-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, role, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-canvas-card border border-canvas-border text-fg rounded-md pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-accent"
          />
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
          <span>Loading organization directory...</span>
        </div>
      ) : employees.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-canvas-border bg-canvas-card/30">
          <Users className="w-8 h-8 text-fg-muted mx-auto mb-2" />
          <h3 className="text-sm font-medium text-fg">No members found</h3>
          <p className="text-xs text-fg-muted mt-1 max-w-sm mx-auto">
            {search ? 'Try clearing your search query.' : 'No employee records registered in the directory yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employees.map((emp) => (
            <Card key={emp.id} className="p-4 flex items-center justify-between hover:border-fg-subtle/40">
              <div className="flex items-center gap-3.5">
                <img
                  src={emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border border-canvas-border"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-fg">
                      {emp.fullName || `${emp.firstName} ${emp.lastName}`}
                    </span>
                    <Badge variant={emp.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                      {emp.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-fg-muted">{emp.jobTitle}</div>
                  <div className="flex items-center gap-2 text-[11px] text-fg-subtle">
                    <span>{emp.departmentName || 'General'}</span>
                    <span>•</span>
                    <span className="font-mono text-accent-light">{emp.employeeCode}</span>
                  </div>
                </div>
              </div>

              <Link to={`/team/${emp.id}`}>
                <Button size="sm" variant="secondary" icon={<ChevronRight className="w-3.5 h-3.5" />}>
                  Dossier
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
