import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-canvas-card border border-canvas-border rounded-lg p-4 transition-all duration-150 ${
        hoverable ? 'hover:border-fg-subtle/40 hover:bg-canvas-card/80 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
