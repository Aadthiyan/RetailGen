import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, ...props }, ref) => {
    return (
      <div className="flex flex-col">
        {label && <label className="mb-2 text-sm font-medium text-gray-700">{label}</label>}
        <select
          ref={ref}
          className={`
            px-3 py-2 border border-gray-300 rounded-md shadow-sm
            focus:outline-none focus:ring-primary-500 focus:border-primary-500
            disabled:bg-gray-100 disabled:text-gray-500
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
