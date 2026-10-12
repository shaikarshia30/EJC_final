import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { GoalDTO } from '@ejc/types';
import { Target, Plus, CheckCircle2, X, AlertCircle } from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<GoalDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [dueDate, setDueDate] = useState('');

  const employeeId = user?.employee?.id;

  const loadGoals = async () => {
    if (!employeeId) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.performance.getGoals(employeeId);
      setGoals(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [employeeId]);

  const handleUpdateProgress = async (goalId: string, delta: number, currentProgress: number) => {
    const newProgress = Math.min(100, Math.max(0, currentProgress + delta));
    const newStatus = newProgress === 100 ? 'COMPLETED' : 'IN_PROGRESS';

    try {
      await api.performance.updateGoal(goalId, newProgress, newStatus);
      await loadGoals();
    } catch (err: any) {
      setError(err.message || 'Failed to update goal progress');
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !employeeId) return;

    setSubmitting(true);
    setError(null);

    const now = new Date();
    const end = dueDate ? new Date(dueDate) : new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    try {
      await api.performance.createGoal({
        employeeId,
        title: newTitle,
        description: newDesc,
        category: 'INDIVIDUAL',
        startDate: now.toISOString(),
        dueDate: end.toISOString(),
        keyResults: [
          { title: 'Milestone Execution & Target Delivery', currentValue: 0, targetValue: 100, unit: '%' },
        ],
      });

      setIsModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setDueDate('');
      await loadGoals();
    } catch (err: any) {
      setError(err.message || 'Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-canvas-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-fg tracking-tight">Goals & Performance OKRs</h1>
          <p className="text-xs text-fg-muted mt-0.5">
            SMART performance objectives directly integrated with your journey milestones and promotion readiness.
          </p>
        </div>
        <Button size="sm" variant="primary" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsModalOpen(true)}>
          Create New Goal
        </Button>
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
          <span>Loading performance goals...</span>
        </div>
      ) : goals.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-canvas-border bg-canvas-card/30">
          <Target className="w-8 h-8 text-fg-muted mx-auto mb-2" />
          <h3 className="text-sm font-medium text-fg">No active goals found</h3>
          <p className="text-xs text-fg-muted mt-1 max-w-sm mx-auto">
            Create key performance objectives and key results to steer your growth and progression.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <Card key={goal.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={goal.status === 'COMPLETED' ? 'success' : 'accent'}>
                  {goal.status}
                </Badge>
                <span className="text-xs text-fg-subtle">
                  Due: {new Date(goal.dueDate).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-fg tracking-tight">{goal.title}</h3>
                {goal.description && (
                  <p className="text-xs text-fg-muted leading-relaxed">{goal.description}</p>
                )}
              </div>

              {/* Progress Bar & Steppers */}
              <div className="space-y-2 pt-2 border-t border-canvas-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-fg-subtle font-medium">Overall Progress</span>
                  <span className="font-mono text-accent-light font-semibold">{goal.progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-canvas-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${goal.progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-[11px] py-1 px-2 h-auto"
                    onClick={() => handleUpdateProgress(goal.id, -10, goal.progressPercent)}
                    disabled={goal.progressPercent <= 0}
                  >
                    -10%
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-[11px] py-1 px-2 h-auto"
                    onClick={() => handleUpdateProgress(goal.id, 10, goal.progressPercent)}
                    disabled={goal.progressPercent >= 100}
                  >
                    +10%
                  </Button>
                  {goal.progressPercent < 100 && (
                    <Button
                      size="sm"
                      variant="primary"
                      className="text-[11px] py-1 px-2 h-auto"
                      onClick={() => handleUpdateProgress(goal.id, 100 - goal.progressPercent, goal.progressPercent)}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-canvas-surface border border-canvas-border rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-canvas-border pb-3">
              <h2 className="text-sm font-semibold text-fg">Define Performance Objective</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-fg-muted hover:text-fg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4 text-xs">
              <Input
                label="Objective Title"
                placeholder="e.g., Deliver Enterprise Identity Integration"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />

              <div className="space-y-1">
                <label className="text-fg-subtle uppercase text-[10px] font-semibold tracking-wider">
                  Target Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-canvas-card border border-canvas-border text-fg rounded-md px-3 py-2 text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-fg-subtle uppercase text-[10px] font-semibold tracking-wider">
                  Description & Context
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Outline expectations, success metrics, and key results..."
                  rows={3}
                  className="w-full bg-canvas-card border border-canvas-border text-fg rounded-md p-2 text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-canvas-border">
                <Button type="button" size="sm" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Establish Goal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
