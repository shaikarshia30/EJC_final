import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { FileText, Search, Plus, ShieldCheck, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

export const DocumentsPage: React.FC = () => {
  const { role } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [category, setCategory] = useState('POLICY');
  const [accessLevel, setAccessLevel] = useState('ALL_EMPLOYEES');

  const loadDocuments = async () => {
    try {
      const data = await api.documents.list();
      setDocs(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load policy knowledge base');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await api.documents.ingest({
        title: newTitle,
        content: newContent,
        category,
        accessLevel,
      });

      setIsModalOpen(false);
      setNewTitle('');
      setNewContent('');
      await loadDocuments();
    } catch (err: any) {
      setError(err.message || 'Document ingestion failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = docs.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.category && d.category.toLowerCase().includes(search.toLowerCase()))
  );

  const isHrOrAdmin = ['ORG_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'].includes(role || '');

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-canvas-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-fg tracking-tight">Policies & Knowledge Base</h1>
          <p className="text-xs text-fg-muted mt-0.5">
            Verified organizational documents indexed for pgvector hybrid retrieval and EJC Copilot.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-60">
            <Search className="w-3.5 h-3.5 text-fg-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-canvas-card border border-canvas-border text-fg rounded-md pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-accent"
            />
          </div>

          {isHrOrAdmin && (
            <Button size="sm" variant="primary" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsModalOpen(true)}>
              Ingest Document
            </Button>
          )}
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
          <span>Loading indexed documents...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-canvas-border bg-canvas-card/30">
          <FileText className="w-8 h-8 text-fg-muted mx-auto mb-2" />
          <h3 className="text-sm font-medium text-fg">No indexed documents found</h3>
          <p className="text-xs text-fg-muted mt-1 max-w-sm mx-auto">
            {search ? 'Try clearing your search query.' : 'Ingest company handbooks and policies to enable semantic AI retrieval.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((doc) => (
            <Card key={doc.id} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="accent" size="sm">
                    {doc.category || 'POLICY'}
                  </Badge>
                  <span className="text-[10px] font-mono text-fg-subtle">
                    {doc.accessLevel || 'ALL_EMPLOYEES'}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-fg">{doc.title}</h3>
                {doc.chunks && (
                  <p className="text-xs text-fg-muted line-clamp-2">
                    {doc.chunks.length} vectorized semantic chunks indexed.
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-canvas-border flex items-center justify-between text-[11px] text-fg-subtle">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Vector Indexed
                </span>
                <span>{new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Ingest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-canvas-surface border border-canvas-border rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-canvas-border pb-3">
              <h2 className="text-sm font-semibold text-fg">Ingest Document to Knowledge Base</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-fg-muted hover:text-fg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIngest} className="space-y-4 text-xs">
              <Input
                label="Document Title"
                placeholder="e.g., Code of Conduct & Remote Policy"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-fg-subtle uppercase text-[10px] font-semibold tracking-wider">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-canvas-card border border-canvas-border text-fg rounded-md px-3 py-2 text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="POLICY">Policy</option>
                    <option value="HANDBOOK">Handbook</option>
                    <option value="BENEFITS">Benefits</option>
                    <option value="ENGINEERING">Engineering</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-fg-subtle uppercase text-[10px] font-semibold tracking-wider">
                    Access Level
                  </label>
                  <select
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value)}
                    className="w-full bg-canvas-card border border-canvas-border text-fg rounded-md px-3 py-2 text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="ALL_EMPLOYEES">All Employees</option>
                    <option value="MANAGERS_ONLY">Managers Only</option>
                    <option value="HR_ONLY">HR & Admin Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-fg-subtle uppercase text-[10px] font-semibold tracking-wider">
                  Document Markdown / Plaintext Content
                </label>
                <textarea
                  required
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste policy document content here..."
                  className="w-full bg-canvas-card border border-canvas-border text-fg rounded-md p-2.5 text-xs focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-canvas-border">
                <Button type="button" size="sm" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="primary" disabled={submitting}>
                  {submitting ? 'Chunking & Indexing...' : 'Index Document'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
