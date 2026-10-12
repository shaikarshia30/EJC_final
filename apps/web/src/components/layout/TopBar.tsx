import React from 'react';
import { Search, Bell, Bot, Sparkles, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { Badge } from '../common/Badge.js';

export interface TopBarProps {
  title?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title = 'Overview' }) => {
  const { organizationName, role, toggleAssistant } = useAuth();

  return (
    <header className="h-14 border-b border-canvas-border bg-canvas-surface/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title & Tenant Info */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-fg tracking-tight">{title}</h1>
        <div className="h-3.5 w-px bg-canvas-border" />
        <div className="flex items-center gap-1.5 text-xs text-fg-subtle">
          <Building className="w-3.5 h-3.5" />
          <span>{organizationName}</span>
        </div>
      </div>

      {/* Global Search & AI Actions */}
      <div className="flex items-center gap-3">
        {/* Search trigger */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-fg-subtle absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search journey, skills, policies... (⌘K)"
            className="text-xs bg-canvas-card border border-canvas-border text-fg rounded-md pl-8 pr-3 py-1.5 w-64 placeholder:text-fg-subtle focus:outline-none focus:border-accent focus:w-80 transition-all duration-200"
          />
        </div>

        {/* AI Assistant Quick Trigger */}
        <button
          onClick={toggleAssistant}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-ai-purple/10 hover:bg-ai-purple/20 text-ai-purple border border-ai-purple/30 text-xs font-medium transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Copilot</span>
        </button>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="w-8 h-8 rounded-md bg-canvas-card border border-canvas-border flex items-center justify-center text-fg-muted hover:text-fg hover:border-canvas-hover transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="w-1.5 h-1.5 rounded-full bg-accent absolute top-2 right-2" />
        </button>

        <Badge variant="neutral" size="sm">
          {role}
        </Badge>
      </div>
    </header>
  );
};
