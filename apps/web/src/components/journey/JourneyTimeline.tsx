import React, { useState } from 'react';
import { JourneyEventDTO, JourneyCategory } from '@ejc/types';
import {
  Compass,
  CheckCircle2,
  Target,
  Sparkles,
  BookOpen,
  Award,
  TrendingUp,
  UserCheck,
  Calendar,
  User,
  ArrowRight,
  Filter,
  Plus,
  X,
} from 'lucide-react';
import { Badge } from '../common/Badge.js';
import { Button } from '../common/Button.js';
import { Card } from '../common/Card.js';

export interface JourneyTimelineProps {
  events: JourneyEventDTO[];
  onAddMilestone?: () => void;
  canEdit?: boolean;
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
  events,
  onAddMilestone,
  canEdit = true,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<JourneyEventDTO | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const categories: { label: string; value: string }[] = [
    { label: 'All Milestones', value: 'ALL' },
    { label: 'Lifecycle', value: 'LIFECYCLE' },
    { label: 'Onboarding', value: 'ONBOARDING' },
    { label: 'Goals', value: 'GOAL' },
    { label: 'Skills', value: 'SKILL' },
    { label: 'Learning', value: 'LEARNING' },
    { label: 'Performance', value: 'PERFORMANCE' },
    { label: 'Career', value: 'CAREER' },
  ];

  const filteredEvents = events.filter((e) => {
    if (filterCategory === 'ALL') return true;
    return e.category === filterCategory;
  });

  const getStageIcon = (category: string) => {
    switch (category) {
      case 'LIFECYCLE':
        return <UserCheck className="w-3.5 h-3.5" />;
      case 'ONBOARDING':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'GOAL':
        return <Target className="w-3.5 h-3.5" />;
      case 'SKILL':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'LEARNING':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'PERFORMANCE':
        return <Award className="w-3.5 h-3.5" />;
      case 'CAREER':
        return <TrendingUp className="w-3.5 h-3.5" />;
      default:
        return <Compass className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryBadgeVariant = (cat: string) => {
    switch (cat) {
      case 'CAREER':
      case 'PERFORMANCE':
        return 'accent' as const;
      case 'SKILL':
        return 'ai' as const;
      case 'ONBOARDING':
      case 'LIFECYCLE':
        return 'success' as const;
      case 'GOAL':
        return 'warning' as const;
      default:
        return 'neutral' as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Journey Lifecycle Stage Progress Bar */}
      <Card className="bg-canvas-card border-canvas-border overflow-x-auto">
        <div className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Lifecycle Path Progression</span>
          <span className="text-accent-light font-normal">Active Development Phase</span>
        </div>

        <div className="flex items-center justify-between min-w-[650px] relative px-4 py-2">
          {/* Connector Line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-canvas-elevated z-0" />
          <div className="absolute left-6 w-[70%] top-1/2 -translate-y-1/2 h-0.5 bg-accent/60 z-0" />

          {[
            { label: 'Joined', done: true },
            { label: 'Onboarding', done: true },
            { label: 'Goals', done: true },
            { label: 'Skills', done: true },
            { label: 'Learning', done: true },
            { label: 'Review', done: true },
            { label: 'Promotion', done: true },
            { label: 'Next (L4)', done: false },
          ].map((stage, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  stage.done
                    ? 'bg-accent text-white ring-4 ring-canvas-card'
                    : 'bg-canvas-surface border border-canvas-border text-fg-subtle ring-4 ring-canvas-card'
                }`}
              >
                {stage.done ? '✓' : idx + 1}
              </div>
              <span
                className={`text-[11px] mt-2 font-medium tracking-tight ${
                  stage.done ? 'text-fg' : 'text-fg-subtle'
                }`}
              >
                {stage.label}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Filter and Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                filterCategory === cat.value
                  ? 'bg-canvas-elevated text-fg border border-canvas-border'
                  : 'text-fg-muted hover:text-fg hover:bg-canvas-card'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {canEdit && onAddMilestone && (
          <Button size="sm" variant="secondary" icon={<Plus className="w-3.5 h-3.5" />} onClick={onAddMilestone}>
            Log Journey Milestone
          </Button>
        )}
      </div>

      {/* Interactive Chronological Timeline Graph */}
      <div className="relative pl-6 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-canvas-border space-y-5">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            onClick={() => setSelectedEvent(evt)}
            className="group relative flex items-start gap-4 cursor-pointer"
          >
            {/* Timeline Node Point */}
            <div className="w-6 h-6 rounded-full bg-canvas-card border border-canvas-border group-hover:border-accent group-hover:bg-accent/15 flex items-center justify-center text-fg-muted group-hover:text-accent-light shrink-0 transition-colors z-10">
              {getStageIcon(evt.category)}
            </div>

            {/* Event Content Card */}
            <div className="flex-1 bg-canvas-card hover:bg-canvas-hover border border-canvas-border rounded-lg p-4 transition-all">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-fg tracking-tight">{evt.title}</h2>
                  <Badge variant={getCategoryBadgeVariant(evt.category)} size="sm">
                    {evt.category}
                  </Badge>
                </div>
                <div className="text-xs text-fg-subtle flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(evt.occurredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              <p className="text-xs text-fg-muted line-clamp-2 mt-1 leading-relaxed">
                {evt.description}
              </p>

              {evt.actorName && (
                <div className="mt-2.5 pt-2 border-t border-canvas-border/50 flex items-center justify-between text-[11px] text-fg-subtle">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-fg-subtle" />
                    <span>Verified by {evt.actorName}</span>
                  </div>
                  <span className="text-accent-light group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Details <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Event Details Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-canvas-surface border-l border-canvas-border h-full flex flex-col p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-canvas-border pb-4">
              <div className="flex items-center gap-2">
                <Badge variant={getCategoryBadgeVariant(selectedEvent.category)}>
                  {selectedEvent.category}
                </Badge>
                <span className="text-xs text-fg-subtle">{selectedEvent.stage}</span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                aria-label="Close details"
                className="text-fg-muted hover:text-fg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-fg-subtle">Milestone Title</div>
                <h2 className="text-base font-semibold text-fg mt-1">{selectedEvent.title}</h2>
              </div>

              <div>
                <div className="text-xs text-fg-subtle">Recorded Date</div>
                <div className="text-xs text-fg mt-0.5">
                  {new Date(selectedEvent.occurredAt).toLocaleString(undefined, {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs text-fg-subtle">Summary & Impact</div>
                <div className="text-xs text-fg-muted mt-1 leading-relaxed bg-canvas-card p-3 rounded border border-canvas-border">
                  {selectedEvent.description}
                </div>
              </div>

              {selectedEvent.actorName && (
                <div>
                  <div className="text-xs text-fg-subtle">Authorizing / Reviewing Party</div>
                  <div className="text-xs text-fg mt-0.5 font-medium">{selectedEvent.actorName}</div>
                </div>
              )}

              <div className="pt-4 border-t border-canvas-border text-[11px] text-fg-subtle">
                Milestone ID: <span className="font-mono">{selectedEvent.id}</span>
                <br />
                Audit status: Verified in immutable employee journey ledger
              </div>
            </div>

            <div className="mt-auto pt-4">
              <Button variant="secondary" className="w-full" onClick={() => setSelectedEvent(null)}>
                Close Milestone Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
