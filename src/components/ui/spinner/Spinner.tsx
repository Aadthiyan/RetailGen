import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', color = 'text-primary-600' }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
    };

    return (
      <div ref={ref} className="flex items-center justify-center">
        <div
          className={`
            ${sizeClasses[size]} ${color}
            animate-spin rounded-full border-4 border-current border-t-transparent
          `}
        />
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';
