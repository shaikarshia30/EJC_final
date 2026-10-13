import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { BookOpen, Award, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const LearningPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const employeeId = user?.employee?.id;

  const loadCourses = async () => {
    try {
      const data = await api.learning.getCourses();
      setCourses(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleEnroll = async (courseId: string, courseTitle: string) => {
    if (!employeeId) return;
    try {
     await api.learning.enroll(employeeId, courseId);

setNotification(`Enrolled in "${courseTitle}"!`);
setTimeout(() => setNotification(null), 4000);

await loadCourses();
      setNotification(`Enrolled in "${courseTitle}"!`);
      setTimeout(() => setNotification(null), 4000);
      await loadCourses();
    } catch (err: any) {
      setError(err.message || 'Enrollment failed');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-canvas-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-fg tracking-tight">Learning Academy & Pathways</h1>
          <p className="text-xs text-fg-muted mt-0.5">
            Targeted curricula aligned with your skill gaps, verified competency milestones, and career trajectory.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-state-success/15 border border-state-success/30 rounded-xl text-xs text-state-success flex items-center gap-3">
          <Award className="w-5 h-5 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-fg-muted text-sm gap-3">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span>Loading course academy...</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-canvas-border bg-canvas-card/30">
          <BookOpen className="w-8 h-8 text-fg-muted mx-auto mb-2" />
          <h3 className="text-sm font-medium text-fg">No courses published yet</h3>
          <p className="text-xs text-fg-muted mt-1 max-w-sm mx-auto">
            Courses will be cataloged here once curriculum paths are published for your organization.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((c) => (
            <Card key={c.id} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="accent" size="sm">
                    {c.skill?.name || 'General Skill'}
                  </Badge>
                  {c.durationMinutes && (
                    <span className="text-xs text-fg-subtle flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {c.durationMinutes}m
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-fg">{c.title}</h3>
                {c.description && (
                  <p className="text-xs text-fg-muted leading-relaxed">{c.description}</p>
                )}
              </div>

              <div className="pt-3 border-t border-canvas-border flex justify-end">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleEnroll(c.id, c.title)}
                >
                  Enroll Course
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
