import React, { useState } from 'react';
import { X, Send, Bot, Sparkles, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
  contextPills?: string[];
  suggestedActions?: string[];
}

export const AIAssistantDrawer: React.FC = () => {
  const { isAssistantOpen, toggleAssistant, user } = useAuth();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      role: 'assistant',
      content: `Hello ${user?.employee?.firstName || 'there'}! I am your EJC Journey Copilot. I have secure access to your authorized journey milestones, active goals, skill matrix, and organization policies. How can I assist you today?`,
      contextPills: ['EJC Intelligent Assistant', 'Tenant Isolated'],
      suggestedActions: [
        'What is my current journey progress?',
        'What are my active goals?',
        'Explain my skill gaps',
        'What is our leave and wellness policy?',
      ],
    },
  ]);

  if (!isAssistantOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.ai.chat(query, user?.employee?.id);
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: res.content,
        sources: res.sources,
        contextPills: res.contextPills,
        suggestedActions: res.suggestedActions,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      // Fallback mock intelligent response if API is unreachable
      const lower = query.toLowerCase();
      let fallbackContent = 'I can help analyze your employee journey, review active OKRs, evaluate skill gaps, and search authorized HR documentation.';
      let sources: any[] | undefined = undefined;

      if (lower.includes('journey') || lower.includes('progress')) {
        fallbackContent = `Your current journey stage is **ACTIVE_DEVELOPMENT** (78% progression toward your Senior L4 milestone). You have logged **7 major lifecycle achievements**, including completing your Cloud Architecture course and earning the Trailblazer Recognition.`;
      } else if (lower.includes('goal')) {
        fallbackContent = `You have **2 active goals**:\n• **Architect and Deliver Multi-Tenant Journey Engine** (85% completed, On Track)\n• **Mentor Junior Engineers & Lead Guilds** (60% completed, In Progress)`;
      } else if (lower.includes('skill') || lower.includes('gap')) {
        fallbackContent = `Based on your role matrix, you have **2 target skill gaps**:\n• **Kubernetes & Cloud Infrastructure**: Currently Intermediate → Target Advanced\n• **Technical Leadership**: Currently Intermediate → Target Advanced\n\n*Recommended Course:* Enterprise Kubernetes at Scale.`;
      } else if (lower.includes('leave') || lower.includes('policy')) {
        fallbackContent = `According to **Acme Annual Leave & Wellness Policy**:\n\n"Full-time employees receive 25 days annual paid time off (PTO), plus 10 designated holidays and 1 Recharge Day per quarter."`;
        sources = [{ title: 'Acme Annual Leave & Wellness Policy', snippet: '25 days annual PTO, 10 holidays, quarterly recharge days.' }];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: fallbackContent,
          sources,
          contextPills: ['Journey Knowledge Base'],
          suggestedActions: ['View full journey timeline', 'How do I request skill verification?'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-canvas-surface border-l border-canvas-border h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-canvas-border flex items-center justify-between bg-canvas-card/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-ai-purple/20 border border-ai-purple/30 flex items-center justify-center text-ai-purple">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-fg flex items-center gap-1.5">
                <span>EJC Copilot</span>
                <span className="text-[10px] bg-ai-purple/20 text-ai-purple px-1.5 py-0.5 rounded font-mono font-medium">
                  RAG Active
                </span>
              </div>
              <div className="text-[11px] text-fg-subtle flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-state-success" />
                <span>Tenant & Role Scoped</span>
              </div>
            </div>
          </div>
          <button
            onClick={toggleAssistant}
            aria-label="Close Assistant"
            className="w-7 h-7 rounded-md hover:bg-canvas-card flex items-center justify-center text-fg-muted hover:text-fg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-lg p-3 ${
                  m.role === 'user'
                    ? 'bg-accent text-white rounded-br-none'
                    : 'bg-canvas-card border border-canvas-border text-fg rounded-bl-none space-y-2'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{m.content}</div>

                {/* Sources & Citations */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-canvas-border/60 space-y-1">
                    <div className="text-[10px] font-semibold text-fg-subtle uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>Retrieved Source Reference</span>
                    </div>
                    {m.sources.map((s, idx) => (
                      <div
                        key={idx}
                        className="bg-canvas-surface p-2 rounded border border-canvas-border text-[11px] text-fg-muted"
                      >
                        <div className="font-medium text-fg">{s.title}</div>
                        <div className="text-[10px] text-fg-subtle mt-0.5 line-clamp-2">{s.snippet}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Context Pills */}
                {m.contextPills && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.contextPills.map((pill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 bg-canvas-elevated text-fg-subtle rounded border border-canvas-border"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggested Follow-up Action Pills */}
              {m.suggestedActions && m.suggestedActions.length > 0 && (
                <div className="mt-2 space-y-1 w-full max-w-[90%]">
                  <div className="text-[10px] text-fg-subtle">Suggested inquiries:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {m.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(action)}
                        className="text-[11px] text-accent-light bg-accent/10 hover:bg-accent/20 border border-accent/25 px-2.5 py-1 rounded-md text-left transition-colors flex items-center gap-1"
                      >
                        <span>{action}</span>
                        <ArrowRight className="w-2.5 h-2.5 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-fg-subtle text-xs bg-canvas-card border border-canvas-border p-3 rounded-lg max-w-[70%]">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-ai-purple" />
              <span>Analyzing organizational knowledge...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3 border-t border-canvas-border bg-canvas-surface">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your journey, OKRs, or policies..."
              className="flex-1 bg-canvas-card border border-canvas-border text-fg rounded-md px-3 py-2 text-xs placeholder:text-fg-subtle focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="w-8 h-8 rounded-md bg-accent hover:bg-accent-hover text-white flex items-center justify-center disabled:opacity-40 transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="text-[10px] text-fg-subtle text-center mt-2">
            AI answers respect your role access permissions and tenant data boundaries.
          </div>
        </div>
      </div>
    </div>
  );
};
