import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  User,
  Target,
  Sparkles,
  BookOpen,
  TrendingUp,
  Users,
  BarChart3,
  FileText,
  ShieldAlert,
  Bot,
  FolderKanban,
  Award,
  LogOut,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const Sidebar: React.FC = () => {
  const { role, user, organizationName, toggleAssistant, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-accent/10 text-accent-light border border-accent/20'
        : 'text-fg-muted hover:text-fg hover:bg-canvas-card'
    }`;

  const isHrOrAdmin = role === 'ORG_ADMIN' || role === 'HR_MANAGER' || role === 'SUPER_ADMIN';
  const isManager = role === 'MANAGER';
  const isEmployee = role === 'EMPLOYEE';

  return (
    <aside className="w-64 bg-canvas-surface border-r border-canvas-border flex flex-col shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-canvas-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-light">
            <Compass className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm tracking-tight text-fg truncate">
              {organizationName || 'EJC'}
            </div>
            <div className="text-[11px] text-fg-subtle">Employee Journey Cloud</div>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Overview */}
        <div>
          <div className="text-[11px] font-semibold text-fg-subtle uppercase tracking-wider px-3 mb-1.5">
            Overview
          </div>
          <nav className="space-y-0.5">
            <NavLink to="/" className={navItemClass}>
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </NavLink>
          </nav>
        </div>

        {/* Manager-Specific Suite */}
        {isManager && (
          <div>
            <div className="text-[11px] font-semibold text-fg-subtle uppercase tracking-wider px-3 mb-1.5">
              Team Management
            </div>
            <nav className="space-y-0.5">
              <NavLink to="/team" className={navItemClass}>
                <Users className="w-4 h-4 shrink-0" />
                <span>Team Roster</span>
              </NavLink>
              <NavLink to="/team-performance" className={navItemClass}>
                <Award className="w-4 h-4 shrink-0" />
                <span>Performance Reviews</span>
              </NavLink>
              <NavLink to="/projects" className={navItemClass}>
                <FolderKanban className="w-4 h-4 shrink-0" />
                <span>Initiatives & Projects</span>
              </NavLink>
            </nav>
          </div>
        )}

        {/* HR / CEO Suite */}
        {isHrOrAdmin && (
          <div>
            <div className="text-[11px] font-semibold text-fg-subtle uppercase tracking-wider px-3 mb-1.5">
              Workforce Governance
            </div>
            <nav className="space-y-0.5">
              <NavLink to="/people" className={navItemClass}>
                <Users className="w-4 h-4 shrink-0" />
                <span>People Directory</span>
              </NavLink>
              <NavLink to="/analytics" className={navItemClass}>
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>Workforce Analytics</span>
              </NavLink>
              <NavLink to="/projects" className={navItemClass}>
                <FolderKanban className="w-4 h-4 shrink-0" />
                <span>Strategic Projects</span>
              </NavLink>
            </nav>
          </div>
        )}

        {/* Employee Journey Core (Shown for Employee & available for self-view) */}
        <div>
          <div className="text-[11px] font-semibold text-fg-subtle uppercase tracking-wider px-3 mb-1.5">
            Journey & Growth
          </div>
          <nav className="space-y-0.5">
            <NavLink to="/journey" className={navItemClass}>
              <Compass className="w-4 h-4 shrink-0" />
              <span>My Journey</span>
            </NavLink>
            <NavLink to="/profile" className={navItemClass}>
              <User className="w-4 h-4 shrink-0" />
              <span>Employee 360</span>
            </NavLink>
            <NavLink to="/goals" className={navItemClass}>
              <Target className="w-4 h-4 shrink-0" />
              <span>Goals & OKRs</span>
            </NavLink>
            <NavLink to="/skills" className={navItemClass}>
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Skill Matrix</span>
            </NavLink>
            <NavLink to="/learning" className={navItemClass}>
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Learning Academy</span>
            </NavLink>
            <NavLink to="/career" className={navItemClass}>
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>Career Path</span>
            </NavLink>
            {isEmployee && (
              <NavLink to="/projects" className={navItemClass}>
                <FolderKanban className="w-4 h-4 shrink-0" />
                <span>Projects</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Intelligence & System */}
        <div>
          <div className="text-[11px] font-semibold text-fg-subtle uppercase tracking-wider px-3 mb-1.5">
            Intelligence & System
          </div>
          <nav className="space-y-0.5">
            <button
              onClick={toggleAssistant}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-ai-purple bg-ai-purple/10 hover:bg-ai-purple/20 transition-colors border border-ai-purple/25"
            >
              <div className="flex items-center gap-2.5">
                <Bot className="w-4 h-4 shrink-0 text-ai-purple" />
                <span>EJC Copilot</span>
              </div>
              <span className="text-[10px] bg-ai-purple/25 px-1.5 py-0.5 rounded font-mono">AI</span>
            </button>
            <NavLink to="/documents" className={navItemClass}>
              <FileText className="w-4 h-4 shrink-0" />
              <span>Policies & RAG</span>
            </NavLink>
            {isHrOrAdmin && (
              <NavLink to="/audit" className={navItemClass}>
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>System Audit Trail</span>
              </NavLink>
            )}
          </nav>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-canvas-border bg-canvas-card/40 space-y-2">
        <div className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-canvas-hover/50 transition-colors">
          <img
            src={user?.employee?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt=""
            className="w-8 h-8 rounded-full object-cover border border-canvas-border"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-fg truncate">
              {user?.employee?.fullName || user?.email || 'User'}
            </div>
            <div className="text-[10px] text-fg-muted truncate flex items-center gap-1">
              <span className="px-1 py-0.2 bg-canvas-surface rounded border border-canvas-border font-mono">
                {role || 'EMPLOYEE'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-neutral-400 hover:text-red-400 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
