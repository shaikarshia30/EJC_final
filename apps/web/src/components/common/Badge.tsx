import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'ai';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-1.5 py-0.5 rounded',
    md: 'text-xs px-2 py-0.5 rounded-md',
  };

  const variantStyles = {
    neutral: 'bg-canvas-elevated text-fg-muted border border-canvas-border',
    accent: 'bg-accent/15 text-accent-light border border-accent/25',
    success: 'bg-state-success/15 text-state-success border border-state-success/25',
    warning: 'bg-state-warning/15 text-state-warning border border-state-warning/25',
    danger: 'bg-state-danger/15 text-state-danger border border-state-danger/25',
    ai: 'bg-ai-purple/15 text-ai-purple border border-ai-purple/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium tracking-wide ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
