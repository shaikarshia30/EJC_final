import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-fg-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3 text-fg-muted pointer-events-none">{icon}</span>}
        <input
          id={inputId}
          className={`w-full text-sm bg-canvas-surface border ${
            error ? 'border-state-danger' : 'border-canvas-border'
          } text-fg rounded-md px-3 py-2 transition-colors placeholder:text-fg-subtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent ${
            icon ? 'pl-9' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-state-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-fg-subtle">{hint}</p>}
    </div>
  );
};
