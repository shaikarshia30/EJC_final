import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import {
  Award,
  Star,
  Users,
  CheckCircle2,
  Calendar,
  Plus,
  AlertCircle,
  X,
} from 'lucide-react';

export const TeamPerformancePage: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [activeCycle, setActiveCycle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [rating, setRating] = useState(4);
  const [strengths, setStrengths] = useState('');
  const [areasForImprovement, setAreasForImprovement] = useState('');
  const [feedback, setFeedback] = useState('');

  const loadData = async () => {
    try {
      const [cycleRes, reviewsRes, empRes] = await Promise.all([
        (api as any).performance.getCycles ? (api as any).performance.getCycles() : fetch('/api/performance/cycles', {
          headers: { Authorization: `Bearer ${localStorage.getItem('ejc_token')}` },
        }).then((r) => r.json()).then((d: any) => d.data),
        fetch('/api/performance/reviews', {
          headers: { Authorization: `Bearer ${localStorage.getItem('ejc_token')}` },
        }).then((r) => r.json()).then((d: any) => d.data || []),
        api.employees.list(),
      ]);

      setActiveCycle(cycleRes);
      setReviews(reviewsRes || []);
      setEmployees(empRes.items || []);
      if (empRes.items && empRes.items.length > 0) {
        setSelectedEmployeeId(empRes.items[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load performance evaluations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCycle?.id || !selectedEmployeeId) return;

    setSubmitting(true);
    setError(null);

    try {
      await api.performance.submitReview({
        cycleId: activeCycle.id,
        employeeId: selectedEmployeeId,
        rating,
        strengths,
        areasForImprovement,
        feedback,
        status: 'FINALIZED',
      });

      setIsModalOpen(false);
      setStrengths('');
      setAreasForImprovement('');
      setFeedback('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-canvas-border pb-6">
        <div>
          <div className="text-xs font-semibold text-accent-light uppercase tracking-wider mb-1">
            TALENT EVALUATION
          </div>
          <h1 className="text-2xl font-bold text-fg tracking-tight">Team Performance Reviews</h1>
          <p className="text-xs text-fg-muted mt-0.5">
            Conduct 360 evaluations, measure goal progress, and finalize performance ratings
          </p>
        </div>

        <div>
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Submit Team Evaluation
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Active Cycle Card */}
      {activeCycle && (
        <Card className="p-5 bg-gradient-to-r from-canvas-card to-canvas-surface">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="accent" size="sm">
                  Active Cycle
                </Badge>
                <h3 className="text-base font-semibold text-fg">{activeCycle.title}</h3>
              </div>
              <p className="text-xs text-fg-muted">
                Standard review cycle for organizational progression and calibrated feedback.
              </p>
            </div>
            <div className="text-xs text-fg-subtle flex items-center gap-2">
              <Calendar className="w-4 h-4 text-fg-muted" />
              <span>
                {new Date(activeCycle.startDate).toLocaleDateString()} –{' '}
                {new Date(activeCycle.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Review Submissions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-fg uppercase tracking-wider">
            Completed Evaluations ({reviews.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-fg-muted text-sm gap-3">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span>Loading performance evaluations...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-canvas-border bg-canvas-card/30">
            <Award className="w-8 h-8 text-fg-muted mx-auto mb-2" />
            <h3 className="text-sm font-medium text-fg">No evaluations recorded yet</h3>
            <p className="text-xs text-fg-muted mt-1 max-w-sm mx-auto">
              Start evaluating team members for the active review cycle using the button above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <Card key={rev.id} className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.employee?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-canvas-border"
                    />
                    <div>
                      <div className="font-semibold text-sm text-fg">
                        {rev.employee ? `${rev.employee.firstName} ${rev.employee.lastName}` : 'Team Member'}
                      </div>
                      <div className="text-xs text-fg-muted">{rev.employee?.jobTitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-1 rounded-md text-xs font-semibold border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{rev.rating} / 5</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {rev.strengths && (
                    <div>
                      <span className="text-fg-subtle font-medium">Core Strengths: </span>
                      <span className="text-fg-muted">{rev.strengths}</span>
                    </div>
                  )}
                  {rev.growthAreas && (
                    <div>
                      <span className="text-fg-subtle font-medium">Growth Areas: </span>
                      <span className="text-fg-muted">{rev.growthAreas}</span>
                    </div>
                  )}
                  {rev.managerReview && (
                    <div className="pt-2 border-t border-canvas-border text-fg-muted italic">
                      "{rev.managerReview}"
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-canvas-border flex justify-between items-center text-[11px] text-fg-subtle">
                  <span>Cycle: {rev.cycle?.title}</span>
                  <span>{new Date(rev.updatedAt).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1015] border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-semibold text-fg">Submit Performance Evaluation</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                  Evaluate Team Member
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName || `${emp.firstName} ${emp.lastName}`} — {emp.jobTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                  Overall Rating (1 to 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className={`flex-1 py-1.5 rounded-lg border text-sm font-semibold transition-all ${
                        rating === num
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                      }`}
                    >
                      {num} ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                  Demonstrated Strengths
                </label>
                <textarea
                  required
                  rows={2}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Exceptional ownership, proactive architectural design, and strong mentorship..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                  Areas for Improvement
                </label>
                <textarea
                  required
                  rows={2}
                  value={areasForImprovement}
                  onChange={(e) => setAreasForImprovement(e.target.value)}
                  placeholder="Increase cross-functional collaboration and document operational runbooks..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                  Evaluation Feedback & Summary
                </label>
                <textarea
                  required
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Comprehensive review summary discussing expectations and progression..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-100"
                />
              </div>

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
                  {submitting ? 'Submitting...' : 'Finalize & Emit Review'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
