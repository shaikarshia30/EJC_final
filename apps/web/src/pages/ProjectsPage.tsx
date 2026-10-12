import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import {
  FolderKanban,
  Plus,
  Calendar,
  Users,
  AlertCircle,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Project Form
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetEndDate, setTargetEndDate] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const loadProjects = async () => {
    try {
      const [projData, empData] = await Promise.all([
        api.projects.list(),
        api.employees.list().catch(() => ({ items: [] })),
      ]);
      setProjects(projData || []);
      setEmployees(empData.items || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.projects.create({
        name,
        code: code.trim() ? code.trim() : undefined,
        description: description.trim() ? description.trim() : undefined,
        status,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        targetEndDate: targetEndDate ? new Date(targetEndDate).toISOString() : undefined,
        memberIds: selectedMemberIds,
      });

      setIsModalOpen(false);
      setName('');
      setCode('');
      setDescription('');
      setSelectedMemberIds([]);
      await loadProjects();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'ACTIVE':
        return <Badge variant="success" size="sm">Active</Badge>;
      case 'PLANNING':
        return <Badge variant="accent" size="sm">Planning</Badge>;
      case 'COMPLETED':
        return <Badge variant="neutral" size="sm">Completed</Badge>;
      default:
        return <Badge variant="warning" size="sm">{st}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-canvas-border pb-6">
        <div>
          <div className="text-xs font-semibold text-accent-light uppercase tracking-wider mb-1">
            INITIATIVES & WORKSPACES
          </div>
          <h1 className="text-2xl font-bold text-fg tracking-tight">Projects & Delivery Streams</h1>
          <p className="text-xs text-fg-muted mt-0.5">
            Cross-functional team initiatives aligned with organizational milestones
          </p>
        </div>

        <div>
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create New Project
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Projects List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-fg-muted text-sm gap-3">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span>Loading project initiatives...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-canvas-border bg-canvas-card/30">
          <FolderKanban className="w-8 h-8 text-fg-muted mx-auto mb-2" />
          <h3 className="text-sm font-medium text-fg">No projects created yet</h3>
          <p className="text-xs text-fg-muted mt-1 max-w-sm mx-auto">
            Create your first strategic initiative or delivery project using the button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <Card key={proj.id} className="p-5 flex flex-col justify-between hover:border-canvas-border-hover transition-all space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    {proj.code && (
                      <span className="text-[10px] font-mono text-accent-light bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                        {proj.code}
                      </span>
                    )}
                    <h3 className="text-base font-semibold text-fg mt-1">{proj.name}</h3>
                  </div>
                  {getStatusBadge(proj.status)}
                </div>

                {proj.description && (
                  <p className="text-xs text-fg-muted line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-3 border-t border-canvas-border text-xs">
                {proj.startDate && (
                  <div className="flex items-center gap-2 text-fg-subtle">
                    <Calendar className="w-3.5 h-3.5 text-fg-muted" />
                    <span>
                      {new Date(proj.startDate).toLocaleDateString()}
                      {proj.targetEndDate ? ` → ${new Date(proj.targetEndDate).toLocaleDateString()}` : ''}
                    </span>
                  </div>
                )}

                {/* Team Members */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-fg-subtle">
                    <Users className="w-3.5 h-3.5" />
                    <span>{proj.members?.length || 0} Members</span>
                  </div>

                  <div className="flex -space-x-1.5 overflow-hidden">
                    {(proj.members || []).slice(0, 4).map((m: any) => (
                      <img
                        key={m.id}
                        src={m.employee?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt=""
                        className="w-6 h-6 rounded-full border border-canvas-card object-cover"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1015] border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-semibold text-fg">Create Project Initiative</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. NextGen Microservices Migration"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                    Code Identifier
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="PRJ-101"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                  Description & Deliverables
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline high-level architectural milestones and objectives..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                    Target End Date
                  </label>
                  <input
                    type="date"
                    value={targetEndDate}
                    onChange={(e) => setTargetEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100"
                  />
                </div>
              </div>

              {/* Assign Members */}
              {employees.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                    Assign Team Members ({selectedMemberIds.length} selected)
                  </label>
                  <div className="max-h-32 overflow-y-auto p-2 bg-neutral-900 rounded-lg border border-neutral-700 space-y-1">
                    {employees.map((emp) => {
                      const isSelected = selectedMemberIds.includes(emp.id);
                      return (
                        <div
                          key={emp.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedMemberIds(selectedMemberIds.filter((id) => id !== emp.id));
                            } else {
                              setSelectedMemberIds([...selectedMemberIds, emp.id]);
                            }
                          }}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer text-xs ${
                            isSelected ? 'bg-indigo-600/30 text-indigo-300' : 'text-neutral-300 hover:bg-neutral-800'
                          }`}
                        >
                          <span>{emp.fullName || `${emp.firstName} ${emp.lastName}`}</span>
                          <span className="text-[10px] text-neutral-500">{emp.jobTitle}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Initialize Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
