import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col">
        {label && <label className="mb-2 text-sm font-medium text-gray-700">{label}</label>}
        <input
          ref={ref}
          className={`
            px-3 py-2 border border-gray-300 rounded-md shadow-sm
            focus:outline-none focus:ring-primary-500 focus:border-primary-500
            disabled:bg-gray-100 disabled:text-gray-500
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
