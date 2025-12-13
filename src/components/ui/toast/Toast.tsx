import React from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ message, type = 'info', duration = 3000, onClose }, ref) => {
    React.useEffect(() => {
      if (duration) {
        const timer = setTimeout(() => {
          onClose?.();
        }, duration);
        return () => clearTimeout(timer);
      }
    }, [duration, onClose]);

    const typeClasses = {
      success: 'bg-green-50 text-green-800 border-green-200',
      error: 'bg-red-50 text-red-800 border-red-200',
      info: 'bg-blue-50 text-blue-800 border-blue-200',
      warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    };

    return (
      <div
        ref={ref}
        className={`
          fixed bottom-4 right-4 px-4 py-3 rounded-md border
          ${typeClasses[type]}
          animation-slide-in-up
        `}
      >
        {message}
      </div>
    );
  }
);

Toast.displayName = 'Toast';
