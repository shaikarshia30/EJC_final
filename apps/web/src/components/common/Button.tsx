import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 rounded gap-1.5',
    md: 'text-sm px-3.5 py-2 rounded-md gap-2',
    lg: 'text-base px-4 py-2.5 rounded-md gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-accent hover:bg-accent-hover text-white shadow-sm active:translate-y-[0.5px]',
    secondary: 'bg-canvas-card hover:bg-canvas-hover text-fg border border-canvas-border active:translate-y-[0.5px]',
    ghost: 'bg-transparent hover:bg-canvas-card text-fg-muted hover:text-fg active:translate-y-[0.5px]',
    danger: 'bg-state-danger/10 text-state-danger hover:bg-state-danger/20 border border-state-danger/30',
  };

  return (
    <button
      className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
