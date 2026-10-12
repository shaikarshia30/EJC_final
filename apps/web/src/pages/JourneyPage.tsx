import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { JourneyTimeline } from '../components/journey/JourneyTimeline.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { JourneyEventDTO, JourneyStage, JourneyCategory } from '@ejc/types';
import { Plus, X, AlertCircle, Compass } from 'lucide-react';

export const JourneyPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<JourneyEventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New milestone form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<JourneyCategory>('CAREER');
  const [stage, setStage] = useState<JourneyStage>('ACTIVE_DEVELOPMENT');

  const employeeId = user?.employee?.id;

  const loadMilestones = async () => {
    if (!employeeId) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.journey.getTimeline(employeeId);
      setEvents(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load journey timeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMilestones();
  }, [employeeId]);

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !employeeId) return;

    setSubmitting(true);
    setError(null);

    try {
      await api.journey.addMilestone({
        employeeId,
        stage,
        category,
        title,
        description,
      });

      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      await loadMilestones();
    } catch (err: any) {
      setError(err.message || 'Failed to record milestone');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-canvas-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-fg tracking-tight">My Employee Journey</h1>
          <p className="text-xs text-fg-muted mt-0.5">
            The chronological digital timeline connecting onboarding, goals, learning, performance, and career advancements.
          </p>
        </div>
        <Button size="sm" variant="primary" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsModalOpen(true)}>
          Record Milestone
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
          <span>Loading journey graph...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-canvas-border bg-canvas-card/30">
          <Compass className="w-8 h-8 text-fg-muted mx-auto mb-2" />
          <h3 className="text-sm font-medium text-fg">No milestones recorded yet</h3>
          <p className="text-xs text-fg-muted mt-1 max-w-sm mx-auto">
            Your journey will document verified lifecycle milestones as you achieve goals and progress. You can also record a milestone manually.
          </p>
        </div>
      ) : (
        <JourneyTimeline events={events} onAddMilestone={() => setIsModalOpen(true)} />
      )}

      {/* Modal for adding custom milestone */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-canvas-surface border border-canvas-border rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-canvas-border pb-3">
              <h2 className="text-sm font-semibold text-fg">Record Journey Milestone</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-fg-muted hover:text-fg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="space-y-4 text-xs">
              <Input
                label="Milestone Title"
                placeholder="e.g., Led Q3 Architecture Modernization"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="space-y-1">
                <label className="text-fg-subtle uppercase text-[10px] font-semibold tracking-wider">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as JourneyCategory)}
                  className="w-full bg-canvas-card border border-canvas-border text-fg rounded-md px-3 py-2 text-xs focus:outline-none focus:border-accent"
                >
                  <option value="LIFECYCLE">Lifecycle</option>
                  <option value="ONBOARDING">Onboarding</option>
                  <option value="GOAL">Goal</option>
                  <option value="SKILL">Skill</option>
                  <option value="LEARNING">Learning</option>
                  <option value="PERFORMANCE">Performance</option>
                  <option value="CAREER">Career</option>
                  <option value="RECOGNITION">Recognition</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-fg-subtle uppercase text-[10px] font-semibold tracking-wider">
                  Lifecycle Stage
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as JourneyStage)}
                  className="w-full bg-canvas-card border border-canvas-border text-fg rounded-md px-3 py-2 text-xs focus:outline-none focus:border-accent"
                >
                  <option value="JOINED">Joined</option>
                  <option value="ONBOARDING">Onboarding</option>
                  <option value="PROBATION">Probation</option>
                  <option value="ACTIVE_DEVELOPMENT">Active Development</option>
                  <option value="MID_REVIEW">Mid Review</option>
                  <option value="PROMOTION">Promotion</option>
                  <option value="LEADERSHIP">Leadership</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-fg-subtle uppercase text-[10px] font-semibold tracking-wider">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the significance and context of this milestone..."
                  rows={3}
                  className="w-full bg-canvas-card border border-canvas-border text-fg rounded-md p-2 text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-canvas-border">
                <Button type="button" size="sm" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="primary" disabled={submitting}>
                  {submitting ? 'Recording...' : 'Add to Graph'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
