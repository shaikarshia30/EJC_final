import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { ShieldCheck, Clock, User, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const data = await api.audit.list();
        setLogs(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, []);

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      <div className="border-b border-canvas-border pb-4">
        <h1 className="text-xl font-bold text-fg tracking-tight">System Audit Trail</h1>
        <p className="text-xs text-fg-muted mt-0.5">
          Immutable event log recording authorization changes, promotions, policy modifications, and data accesses.
        </p>
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
          <span>Loading immutable audit ledger...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-canvas-border bg-canvas-card/30">
          <ShieldCheck className="w-8 h-8 text-fg-muted mx-auto mb-2" />
          <h3 className="text-sm font-medium text-fg">No audit records logged yet</h3>
          <p className="text-xs text-fg-muted mt-1 max-w-sm mx-auto">
            System modifications, promotions, and data governance updates will be logged here with cryptographic timestamps.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="accent" size="sm">
                    {log.action}
                  </Badge>
                  <span className="font-medium text-fg">{log.resource}</span>
                </div>
                <div className="text-fg-muted flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-fg-subtle" />
                  <span>Actor: {log.actor?.email || log.actorId}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-fg-subtle shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
